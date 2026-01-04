import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- 1. MATRICES DATA ---
const DEFAULT_MATRICES = {
  '5v5': { us: Array(5).fill(Array(8).fill(true)), opponent: Array(5).fill(Array(8).fill(true)) },
  '5v6': { us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true]], opponent: Array(6).fill(Array(8).fill(true)) },
  '5v7': { us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true]], opponent: Array(7).fill(Array(8).fill(true)) },
  '5v8': { us: Array(5).fill(Array(8).fill(true)), opponent: [[true,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,false,true,true,true,false],[false,true,true,true,false,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,false,true,true],[false,true,false,true,true,true,false,true]] },
  '5v9': { us: Array(5).fill(Array(8).fill(true)), opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '5v10': { us: Array(5).fill(Array(8).fill(true)), opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '6v6': { us: [[true,true,false,true,true,true,true,true],[false,true,true,true,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,false,true],[true,false,true,true,true,true,true,false]], opponent: [[true,true,false,true,true,true,true,true],[false,true,true,true,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,false,true],[true,false,true,true,true,true,true,false]] },
  '6v7': { us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false]], opponent: [[true,true,true,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,false,true,true,true,true,true,true],[true,true,false,false,true,true,true,true],[true,true,true,true,true,false,true,false],[true,true,true,true,true,true,true,false],[true,false,true,false,true,true,true,false]] },
  '6v8': { us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,false,true,true,true,true,true,true],[true,true,true,false,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,true,true,true,false]], opponent: [[true,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,false,true,true,true,false],[false,true,true,true,false,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,false,true,true],[false,true,false,true,true,true,false,true]] },
  '6v9': { us: [[false,true,true,true,true,true,false,true],[true,true,false,true,true,true,true,false],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,true,true],[true,false,true,true,true,true,true,true],[true,true,true,true,true,false,true,true]], opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '6v10': { us: [[false,true,true,true,true,true,false,true],[true,false,true,true,true,true,true,false],[true,true,false,true,true,true,true,true],[true,true,true,false,true,true,true,true],[true,true,true,true,false,true,true,true],[true,true,true,true,true,false,true,true]], opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '7v7': { us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false]], opponent: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false]] },
  '7v8': { us: [[false,true,false,true,false,true,true,true],[false,true,false,true,true,true,false,true],[true,true,true,true,false,true,true,false],[true,false,true,true,true,false,true,true],[true,true,true,false,true,true,true,false],[true,true,true,false,true,true,false,true],[true,false,true,true,true,false,true,true]], opponent: [[false,true,false,true,false,true,true,true],[false,true,false,true,true,true,false,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,false,true],[true,false,true,true,true,false,true,false],[true,true,true,false,true,false,true,false],[true,false,true,false,true,false,true,true],[true,false,true,false,true,true,true,false]] },
  '7v9': { us: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,true,false,true],[true,true,true,true,false,true,true,false],[true,true,false,true,true,true,true,false]], opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '7v10': { us: [[false,true,true,true,true,true,false,true],[true,true,false,true,true,false,true,false],[true,false,true,true,false,true,true,true],[true,true,true,false,true,true,true,false],[false,true,true,true,false,true,true,true],[true,false,true,true,true,false,true,true],[true,true,false,true,true,true,false,true]], opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]] },
  '8v8': { us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]], opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]] },
  '8v9': { us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,true,true,false,true,false,true,false]], opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]] },
  '8v10': { us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]], opponent: [[true,false,false,true,false,true,false,true],[false,true,true,false,false,true,false,true],[false,true,false,true,true,false,false,true],[false,true,false,true,false,true,true,false],[false,true,false,true,false,true,false,true],[false,true,true,false,true,false,true,false],[true,false,false,true,true,false,true,false],[true,false,true,false,false,true,true,false],[true,false,true,false,true,false,false,true],[true,false,true,false,true,false,true,false]] },
  '9v9': { us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]], opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]] },
  '9v10': { us: [[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true],[true,false,true,false,true,false,true,false]], opponent: [[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]] },
};

const getCanonicalKey = (usCount, oppCount) => {
  const n = parseInt(usCount) || 0;
  const m = parseInt(oppCount) || 0;
  if (n === 0 || m === 0) return { key: '5v5', flip: false }; // Safe default
  return n <= m ? { key: `${n}v${m}`, flip: false } : { key: `${m}v${n}`, flip: true };
};

const initialRoster = Array.from({ length: 9 }, (_, i) => ({
  rank: i + 1,
  name: ["Brody", "Keller", "Danny", "Josh", "Sam", "Ben", "Mason", "Malcolm", "Jimmy"][i] || "",
  isPresent: false,
}));

// --- 2. CUSTOM HOOKS ---
const useRoster = () => {
  const [roster, setRoster] = useState(() => {
    const saved = localStorage.getItem('basketball-roster');
    return saved ? JSON.parse(saved) : initialRoster;
  });

  useEffect(() => {
    localStorage.setItem('basketball-roster', JSON.stringify(roster));
  }, [roster]);

  return { 
    roster, 
    updatePlayerName: (rank, newName) => setRoster(prev => prev.map(p => p.rank === rank ? { ...p, name: newName } : p)),
    togglePlayerAttendance: (rank) => setRoster(prev => prev.map(p => p.rank === rank ? { ...p, isPresent: !p.isPresent } : p)),
    presentPlayerCount: roster.filter(p => p.isPresent).length 
  };
};

const useMatrix = (roster) => {
  const [opponentCount, setOpponentCount] = useState(8);
  
  // Load opponent names from LocalStorage or default to empty object
  const [opponentNames, setOpponentNames] = useState(() => {
    const saved = localStorage.getItem('opponent-names');
    return saved ? JSON.parse(saved) : {};
  });

  // Save opponent names whenever they change
  useEffect(() => {
    localStorage.setItem('opponent-names', JSON.stringify(opponentNames));
  }, [opponentNames]);

  const usCount = roster.filter(p => p.isPresent).length;
  const { key, flip } = getCanonicalKey(usCount, opponentCount);

  const currentMatrix = useMemo(() => {
    const data = DEFAULT_MATRICES[key];
    if (!data) return null;
    return {
      usRotation: flip ? data.opponent : data.us,
      opponentRotation: flip ? data.us : data.opponent,
      periods: 8
    };
  }, [key, flip]);

  const updateOpponentName = (idx, name) => {
    setOpponentNames(prev => ({ ...prev, [idx]: name }));
  };

  return { 
    currentMatrix, 
    opponentCount, 
    setOpponentCount, 
    matrixKey: key, 
    opponentNames, 
    updateOpponentName 
  };
};
// --- 3. COMPONENTS ---
const Navigation = ({ currentPage, setCurrentPage }) => (
  <nav className="max-w-7xl mx-auto mb-8 bg-white shadow-xl rounded-xl p-3 flex flex-wrap justify-center gap-4 border-b-4 border-indigo-500">
    {['attendance', 'grid', 'roster'].map(id => (
      <button key={id} onClick={() => setCurrentPage(id)} className={`px-8 py-2 text-sm font-bold rounded-lg transition-all ${currentPage === id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}>
        {id === 'attendance' ? 'Check-In' : id === 'grid' ? 'Rotation Grid' : 'Roster Setup'}
      </button>
    ))}
  </nav>
);

const AttendanceCheckin = ({ roster, togglePlayerAttendance, presentPlayerCount }) => (
  <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Check-In Attendance</h2>
    <p className="text-sm text-gray-500 mb-4">Total Present: <span className="font-bold text-indigo-600">{presentPlayerCount}</span></p>
    <div className="grid grid-cols-2 gap-3">
      {roster.map(p => (
        <button key={p.rank} onClick={() => togglePlayerAttendance(p.rank)} className={`p-3 rounded-xl shadow font-semibold transition transform active:scale-95 ${p.isPresent ? 'bg-green-500 text-white ring-2 ring-green-600' : 'bg-white text-gray-700 border border-gray-300'}`}>
          {p.name || `Player ${p.rank}`}
        </button>
      ))}
    </div>
  </div>
);

const RosterSetup = ({ roster, updatePlayerName }) => (
  <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Roster Setup</h2>
    <div className="space-y-3">
      {roster.map(p => (
        <div key={p.rank} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <span className="font-mono text-lg font-bold text-indigo-600 w-8 text-center">{p.rank}</span>
          <input type="text" value={p.name} onChange={(e) => updatePlayerName(p.rank, e.target.value)} className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
      ))}
    </div>
  </div>
);

const PlayerMatrixGrid = ({ roster, currentMatrix, matrixKey, setOpponentCount, opponentCount, opponentNames, updateOpponentName }) => {
  const [curP, setCurP] = useState(null);
  const presentRoster = useMemo(() => roster.filter(p => p.isPresent), [roster]);

  if (presentRoster.length < 5) return <div className="text-center p-8 bg-white rounded-lg shadow-xl m-4"><p className="font-bold text-red-500">Check in 5+ players to view grid.</p></div>;
  if (!currentMatrix) return <div className="text-center p-8 bg-white rounded-lg shadow-xl m-4">Loading Matrix...</div>;

  const renderTbl = (rot, team) => {
    return (
      <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200">
        <table className="min-w-full bg-white table-fixed border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-1 py-2 text-[10px] font-bold text-gray-500 uppercase border-r w-[90px]">TEAM</th>
              {[1,2,3,4,5,6,7,8].map(p => <th key={p} className={`px-1 py-2 text-xs font-bold ${curP === p ? 'bg-indigo-300' : 'text-gray-500'}`}>P{p}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rot.map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50">
                <td className="py-2 text-[11px] font-bold bg-white border-r text-center px-1">
                  {team === 'us' ? (
                    <span className="truncate block mx-auto">{presentRoster[i]?.name || `Player ${i+1}`}</span>
                  ) : (
                    <input 
                      type="text" 
                      value={opponentNames[i] || ""} 
                      placeholder={`Player ${i + 1}`}
                      onChange={(e) => updateOpponentName(i, e.target.value)} 
                      className="w-full text-center outline-none bg-transparent placeholder-gray-400" 
                    />
                  )}
                </td>
                {row.map((on, j) => (
                  <td key={j} className={`px-1 py-2 text-center ${curP === j + 1 ? 'bg-indigo-100' : ''}`}>
                    <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center border-2 ${on ? 'bg-green-500 border-green-600 text-white text-[10px] font-bold' : 'bg-gray-100 border-gray-300'}`}>{on ? 'X' : ''}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Your Team</label><div className="text-xl font-bold text-indigo-700">{presentRoster.length} Players</div></div>
        <div className="text-center"><label className="text-[10px] font-bold text-gray-400 uppercase">Opponents</label><div className="flex gap-1 mt-1">{[10,9,8,7,6,5].map(c => <button key={c} onClick={() => setOpponentCount(c)} className={`w-8 h-8 rounded font-bold text-xs border-2 ${opponentCount === c ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-indigo-200'}`}>{c}</button>)}</div></div>
        <div className="text-right"><label className="text-[10px] font-bold text-gray-400 uppercase">Matchup</label><div className="text-lg font-bold text-indigo-700">{matrixKey.toUpperCase()}</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div><h3 className="text-sm font-bold mb-2 text-gray-600 uppercase">Your Team</h3>{renderTbl(currentMatrix.usRotation, 'us')}</div>
        <div><h3 className="text-sm font-bold mb-2 text-gray-600 uppercase">Opponents</h3>{renderTbl(currentMatrix.opponentRotation, 'opponent')}</div>
      </div>
    </div>
  );
};
  const renderTbl = (rot, isUsTeam) => {
    return (
      <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200">
        <table className="min-w-full bg-white table-fixed border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-1 py-2 text-[10px] font-bold text-gray-500 uppercase border-r w-[90px]">
                {isUsTeam ? "YOUR TEAM" : "OPPONENTS"}
              </th>
              {[1,2,3,4,5,6,7,8].map(p => (
                <th key={p} className={`px-1 py-2 text-xs font-bold ${curP === p ? 'bg-indigo-300' : 'text-gray-500'}`}>P{p}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rot.map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50">
                <td className="py-2 text-[11px] font-bold bg-white border-r text-center truncate px-1">
                  {/* FIX: If usTeam, use roster name. If opponent, use a generated label */}
                  {isUsTeam ? (presentRoster[i]?.name || `Player ${i+1}`) : `Opponent ${i+1}`}
                </td>
                {row.map((on, j) => (
                  <td key={j} className={`px-1 py-2 text-center ${curP === j + 1 ? 'bg-indigo-100' : ''}`}>
                    <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center border-2 ${on ? 'bg-green-500 border-green-600 text-white text-[10px] font-bold' : 'bg-gray-100 border-gray-300'}`}>
                      {on ? 'X' : ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Your Team</label>
          <div className="text-xl font-bold text-indigo-700">{presentRoster.length} Players</div>
        </div>
        <div className="text-center">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Opponents</label>
          <div className="flex gap-1 mt-1">
            {[10,9,8,7,6,5].map(c => (
              <button key={c} onClick={() => setOpponentCount(c)} className={`w-8 h-8 rounded font-bold text-xs border-2 ${opponentCount === c ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-indigo-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Matchup</label>
          <div className="text-lg font-bold text-indigo-700">{matrixKey.toUpperCase()}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-600 uppercase tracking-tight">Your Roster</h3>
          {renderTbl(currentMatrix.usRotation, true)}
        </div>
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-600 uppercase tracking-tight">Opponent Roster</h3>
          {renderTbl(currentMatrix.opponentRotation, false)}
        </div>
      </div>

      <button 
        onClick={() => {localStorage.clear(); window.location.reload();}}
        className="mt-8 text-[10px] text-gray-400 underline hover:text-red-500 block mx-auto"
      >
        Clear Local Data & Reset App
      </button>
    </div>
  );
};

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Your Team</label><div className="text-xl font-bold text-indigo-700">{presentRoster.length} Players</div></div>
        <div className="text-center"><label className="text-[10px] font-bold text-gray-400 uppercase">Opponents</label><div className="flex gap-1 mt-1">{[10,9,8,7,6,5].map(c => <button key={c} onClick={() => setOpponentCount(c)} className={`w-8 h-8 rounded font-bold text-xs border-2 ${opponentCount === c ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-indigo-200'}`}>{c}</button>)}</div></div>
        <div className="text-right"><label className="text-[10px] font-bold text-gray-400 uppercase">Matchup</label><div className="text-lg font-bold text-indigo-700">{matrixKey.toUpperCase()}</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div><h3 className="text-sm font-bold mb-2 text-gray-600 uppercase tracking-tight">Your Team Rotation</h3>{renderTbl(currentMatrix.usRotation, 'us')}</div>
        <div><h3 className="text-sm font-bold mb-2 text-gray-600 uppercase tracking-tight">Opponent Team Rotation</h3>{renderTbl(currentMatrix.opponentRotation, 'opponent')}</div>
      </div>
    </div>
  );
};

const App = () => {
  const { roster, updatePlayerName, togglePlayerAttendance, presentPlayerCount } = useRoster();
  const matrixProps = useMatrix(roster);
  const [page, setPage] = useState('attendance');

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-800">Rotation Matrix</h1>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">League Tool v2.1</p>
      </header>
      <Navigation currentPage={page} setCurrentPage={setPage} />
      <main className="max-w-7xl mx-auto">
        {page === 'attendance' && <AttendanceCheckin roster={roster} togglePlayerAttendance={togglePlayerAttendance} presentPlayerCount={presentPlayerCount} />}
        {page === 'grid' && <PlayerMatrixGrid roster={roster} presentPlayerCount={presentPlayerCount} {...matrixProps} />}
        {page === 'roster' && <RosterSetup roster={roster} updatePlayerName={updatePlayerName} />}
      </main>
    </div>
  );
};

export default App;
