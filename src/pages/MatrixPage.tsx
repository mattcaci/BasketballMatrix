import { useMemo, useState } from 'react';
import { buildRotationRows, getTemplateByKey, getTemplateHints } from '../matrices/matrixUtils';
import { useAppState } from '../storage/AppStateContext';
import type { PlayStatus } from '../types/models';

function statusForPeriod(statuses: PlayStatus[], period: number): PlayStatus {
  return statuses[period - 1] ?? 'SIT';
}

export function MatrixPage() {
  const { players, session, setOpponentCount, setCurrentPeriod } = useAppState();
  const [viewMode, setViewMode] = useState<'grid' | 'game'>('grid');
  const [benchOnly, setBenchOnly] = useState(false);

  const presentPlayers = useMemo(
    () => players.filter((player) => session.presentPlayerIds.includes(player.id)).sort((a, b) => a.rank - b.rank),
    [players, session.presentPlayerIds]
  );

  const template = getTemplateByKey(session.selectedMatrixKey);
  const rows = template ? buildRotationRows(presentPlayers, template) : [];

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
    const text = currentPlaying.map((row) => row.player.name).join(', ');
    await navigator.clipboard.writeText(text);
  };

  const onExportCsv = () => {
    if (!template) return;
    const headers = 'dateTime,matchupKey,opponentCount,playerName,rank,period,status';
    const lines = rows.flatMap((row) => row.statuses.map((status, index) => [
      session.dateTime,
      session.selectedMatrixKey,
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
    link.download = `rotation-${session.selectedMatrixKey}-${session.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!template) {
    const hints = getTemplateHints(session.presentPlayerIds.length, session.opponentCount);
    return (
      <div className="page">
        <h1>Rotation Matrix</h1>
        <p className="error">No template for {session.selectedMatrixKey}</p>
        <p>Available nearby templates: {hints.length ? hints.join(', ') : 'None'}</p>
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
        <div className="matrix-label">Matchup: <strong>{session.selectedMatrixKey}</strong></div>
        <label>
          View mode
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'grid' | 'game')}>
            <option value="grid">Full Grid</option>
            <option value="game">Game View</option>
          </select>
        </label>
      </div>

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
                    <td className="sticky-col">{row.player.name}</td>
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
            <div className="chip">P{session.currentPeriod} - {currentPlaying.map((row) => row.player.name).join(', ') || 'None'}</div>
            {session.currentPeriod < 8 ? <div className="chip">Next P{session.currentPeriod + 1} - {nextPlaying.map((row) => row.player.name).join(', ') || 'None'}</div> : null}
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={benchOnly} onChange={(e) => setBenchOnly(e.target.checked)} /> Bench Only
          </label>
          {!benchOnly ? (
            <>
              <section className="panel"><h3>PLAYING NOW</h3>{currentPlaying.map((row) => <div key={row.player.id}>{row.player.name}</div>)}</section>
              <section className="panel"><h3>SITTING NOW</h3>{currentSitting.map((row) => <div key={row.player.id}>{row.player.name}</div>)}</section>
              {session.currentPeriod < 8 ? (
                <section className="panel"><h3>NEXT UP</h3>
                  <p>Playing: {nextPlaying.map((row) => row.player.name).join(', ') || 'None'}</p>
                  <p>Sitting: {nextSitting.map((row) => row.player.name).join(', ') || 'None'}</p>
                </section>
              ) : null}
            </>
          ) : (
            <section className="panel"><h3>Bench</h3>
              <p>Now: {currentSitting.map((row) => row.player.name).join(', ') || 'None'}</p>
              {session.currentPeriod < 8 ? <p>Next: {nextSitting.map((row) => row.player.name).join(', ') || 'None'}</p> : null}
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
