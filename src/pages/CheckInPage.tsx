import { useNavigate } from 'react-router-dom';
import { useAppState } from '../storage/AppStateContext';

export function CheckInPage() {
  const { players, session, toggleAttendance, newGame, setLockRosterOrder } = useAppState();
  const navigate = useNavigate();
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  const vibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  return (
    <div className="page">
      <h1>Player Check-in</h1>
      <p className="counter">Present: {session.presentPlayerIds.length} / Total {players.length}</p>

      <div className="check-grid">
        {sortedPlayers.map((player) => {
          const present = session.presentPlayerIds.includes(player.id);
          return (
            <button
              key={player.id}
              className={`player-card ${present ? 'present' : ''}`}
              onClick={() => {
                vibrate();
                toggleAttendance(player.id);
              }}
              type="button"
            >
              <span className="name">#{player.rank} {player.name}</span>
              {player.jerseyNumber ? <span className="meta">Jersey {player.jerseyNumber}</span> : null}
              {present ? <span className="checkmark">✓</span> : null}
            </button>
          );
        })}
      </div>

      <div className="stack-actions">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={Boolean(session.lockRosterOrder)}
            onChange={(event) => setLockRosterOrder(event.target.checked)}
          />
          Lock roster order for this session
        </label>
        <button type="button" className="primary" onClick={newGame}>New Game</button>
        <button type="button" className="secondary" onClick={() => navigate('/matrix')}>Go to Matrix</button>
      </div>
    </div>
  );
}
