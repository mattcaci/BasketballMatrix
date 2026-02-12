import { useState } from 'react';
import { useAppState } from '../storage/AppStateContext';
import type { Player } from '../types/models';

export function RosterPage() {
  const { players, setPlayers } = useAppState();
  const [newName, setNewName] = useState('');

  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    const next = players.map((player) => (player.id === id ? { ...player, ...updates } : player));
    setPlayers(next);
  };

  const swapRank = (id: string, delta: -1 | 1) => {
    const ordered = [...sortedPlayers];
    const idx = ordered.findIndex((player) => player.id === id);
    const swapIdx = idx + delta;
    if (swapIdx < 0 || swapIdx >= ordered.length) return;

    [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];
    const reranked = ordered.map((player, i) => ({ ...player, rank: i + 1 }));
    setPlayers(reranked);
  };

  const addPlayer = () => {
    if (!newName.trim()) return;
    const next = [...players, { id: crypto.randomUUID(), name: newName.trim(), rank: players.length + 1, active: true }];
    setPlayers(next);
    setNewName('');
  };

  return (
    <div className="page">
      <h1>Roster</h1>
      <div className="add-row">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Player name" />
        <button type="button" className="primary" onClick={addPlayer}>Add</button>
      </div>

      <div className="roster-list">
        {sortedPlayers.map((player) => (
          <article key={player.id} className="roster-card">
            <div className="rank-badge">#{player.rank}</div>
            <div className="roster-fields">
              <input
                value={player.name}
                onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                aria-label={`name-${player.rank}`}
              />
              <input
                value={player.jerseyNumber ?? ''}
                onChange={(e) => updatePlayer(player.id, { jerseyNumber: e.target.value })}
                placeholder="Jersey #"
                aria-label={`jersey-${player.rank}`}
              />
            </div>
            <div className="rank-controls">
              <button type="button" onClick={() => swapRank(player.id, -1)}>↑</button>
              <button type="button" onClick={() => swapRank(player.id, 1)}>↓</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
