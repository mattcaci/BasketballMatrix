import { useMemo, useState } from 'react';
import { buildRotationRows, getAvailableMatrixKeys, selectMatrixGrid } from '../matrices/matrixUtils';
import { useAppState } from '../storage/AppStateContext';
import type { PlayStatus, Player } from '../types/models';

function statusForPeriod(statuses: PlayStatus[], period: number): PlayStatus {
  return statuses[period - 1] ?? 'SIT';
}

function playerLabel(player: Player): string {
  return player.jerseyNumber ? `${player.name} (#${player.jerseyNumber})` : player.name;
}

export function MatrixPage() {
  const { players, session, setOpponentCount, setCurrentPeriod } = useAppState();
  const [viewMode, setViewMode] = useState<'grid' | 'game'>('grid');
  const [benchOnly, setBenchOnly] = useState(false);

  const presentPlayers = useMemo(
    () => players.filter((player) => session.presentPlayerIds.includes(player.id)).sort((a, b) => a.rank - b.rank),
    [players, session.presentPlayerIds]
  );

  const selection = selectMatrixGrid(presentPlayers.length, session.opponentCount);
  const rows = selection.grid ? buildRotationRows(presentPlayers, selection.grid) : [];

  const currentPlaying = rows.filter((row) => statusForPeriod(row.statuses, session.currentPeriod) === 'PLAY');
  const currentSitting = rows.filter((row) => statusForPeriod(row.statuses, session.currentPeriod) === 'SIT');
  const nextPlaying = session.currentPeriod < 8
    ? rows.filter((row) => statusForPeriod(row.statuses, session.currentPeriod + 1) === 'PLAY')
    : [];
  const nextSitting = session.currentPeriod < 8
    ? rows.filter((row) => statusForPeriod(row.statuses, session.currentPeriod + 1) === 'SIT')
    : [];

  const playCounts = rows.map((row) => ({
    name: row.player.name,
    count: row.statuses.filter((status) => status === 'PLAY').length
  }));
  const minPlays = Math.min(...playCounts.map((entry) => entry.count), 0);
  const maxPlays = Math.max(...playCounts.map((entry) => entry.count), 0);

  const onCopyPlaying = async () => {
    const text = currentPlaying.map((row) => playerLabel(row.player)).join(', ');
    await navigator.clipboard.writeText(text);
  };

  const onExportCsv = () => {
    if (!selection.grid) return;
    const headers = 'dateTime,matchupKey,opponentCount,playerName,rank,period,status';
    const lines = rows.flatMap((row) => row.statuses.map((status, index) => [
      session.dateTime,
      selection.canonicalKey,
      String(session.opponentCount),
      row.player.name,
      String(row.player.rank),
      String(index + 1),
      status
    ].join(',')));

    const blob = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotation-${selection.canonicalKey}-${session.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!selection.grid) {
    const available = getAvailableMatrixKeys();
    return (
      <div className="page">
        <h1>Rotation Matrix</h1>
        <p className="error">{selection.error ?? `No matrix for ${selection.canonicalKey}`}</p>
        <p>Available matrices: {available.length ? available.join(', ') : 'None'}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Rotation Matrix</h1>
      <div className="control-grid">
        <label>
          Opponent Count
          <select value={session.opponentCount} onChange={(e) => setOpponentCount(Number(e.target.value))}>
            {Array.from({ length: 6 }).map((_, i) => (
              <option key={i + 5} value={i + 5}>{i + 5}</option>
            ))}
          </select>
        </label>
        <div className="matrix-label">Matchup: <strong>{selection.canonicalKey}</strong></div>
        <label>
          View mode
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'grid' | 'game')}>
            <option value="grid">Full Grid</option>
            <option value="game">Game View</option>
          </select>
        </label>
      </div>

      {selection.usedOppGrid ? (
        <p className="warning">Using opponent grid from {selection.canonicalKey} because our team has {presentPlayers.length} players.</p>
      ) : null}

      <div className="period-stepper">
        <button type="button" onClick={() => setCurrentPeriod(session.currentPeriod - 1)}>Prev</button>
        <strong>Period {session.currentPeriod}</strong>
        <button type="button" onClick={() => setCurrentPeriod(session.currentPeriod + 1)}>Next</button>
      </div>

      {viewMode === 'grid' ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className={session.currentPeriod === i + 1 ? 'current' : ''}>P{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.player.id}>
                    <td className="sticky-col">{playerLabel(row.player)}</td>
                    {row.statuses.map((status, i) => (
                      <td key={i} className={session.currentPeriod === i + 1 ? 'current' : ''}>
                        {status === 'PLAY' ? '🏀 PLAY' : '🪑 SIT'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stack-actions">
            <button type="button" className="secondary" onClick={() => window.print()}>Print</button>
            <button type="button" className="secondary" onClick={onExportCsv}>Export CSV</button>
          </div>
        </>
      ) : (
        <div className="game-view">
          <div className="chip-row">
            <div className="chip">P{session.currentPeriod} - {currentPlaying.map((row) => playerLabel(row.player)).join(', ') || 'None'}</div>
            {session.currentPeriod < 8 ? <div className="chip">Next P{session.currentPeriod + 1} - {nextPlaying.map((row) => playerLabel(row.player)).join(', ') || 'None'}</div> : null}
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={benchOnly} onChange={(e) => setBenchOnly(e.target.checked)} /> Bench Only
          </label>
          {!benchOnly ? (
            <>
              <section className="panel"><h3>PLAYING NOW</h3>{currentPlaying.map((row) => <div key={row.player.id}>{playerLabel(row.player)}</div>)}</section>
              <section className="panel"><h3>SITTING NOW</h3>{currentSitting.map((row) => <div key={row.player.id}>{playerLabel(row.player)}</div>)}</section>
              {session.currentPeriod < 8 ? (
                <section className="panel"><h3>NEXT UP</h3>
                  <p>Playing: {nextPlaying.map((row) => playerLabel(row.player)).join(', ') || 'None'}</p>
                  <p>Sitting: {nextSitting.map((row) => playerLabel(row.player)).join(', ') || 'None'}</p>
                </section>
              ) : null}
            </>
          ) : (
            <section className="panel"><h3>Bench</h3>
              <p>Now: {currentSitting.map((row) => playerLabel(row.player)).join(', ') || 'None'}</p>
              {session.currentPeriod < 8 ? <p>Next: {nextSitting.map((row) => playerLabel(row.player)).join(', ') || 'None'}</p> : null}
            </section>
          )}
          <button type="button" className="primary" onClick={() => void onCopyPlaying()}>Copy Playing Now</button>
          <button type="button" className="secondary" onClick={onExportCsv}>Export CSV</button>
        </div>
      )}

      <aside className="summary-panel">
        <h3>Play Summary</h3>
        {playCounts.map((entry) => <p key={entry.name}>{entry.name}: {entry.count}</p>)}
        {maxPlays - minPlays > 1 ? <p className="warning">Fairness warning: difference greater than 1 period.</p> : null}
      </aside>
    </div>
  );
}
