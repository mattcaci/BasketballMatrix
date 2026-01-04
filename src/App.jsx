import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Delete the initializeApp, getAuth, and getFirestore lines.

// Helper function to derive a canonical key (smaller player count first)
const getCanonicalKey = (usCount, oppCount) => {
  const n = parseInt(usCount);
  const m = parseInt(oppCount);
  if (n === 0 || m === 0) return '0v0';

  if (n <= m) {
    return `${n}v${m}`;
  } else {
    // If n > m, signal that we need to flip the rotations upon load
    return { canonicalKey: `${m}v${n}`, needsFlip: true };
  }
};

// Matrix structure definitions
const DEFAULT_MATRICES = {
  '5v5': {
    us: Array(5).fill(Array(8).fill(true)),
    opponent: Array(5).fill(Array(8).fill(true))
  },
  '5v6': {
    us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true]],
    opponent: Array(6).fill(Array(8).fill(true))
  },
  '5v7': {
    us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true]],
    opponent: Array(7).fill(Array(8).fill(true))
  },
  '5v8': {
    us: Array(5).fill(Array(8).fill(true)),
    opponent: [[true,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,false,true,true,true,false],[false,true,true,true,false,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,false,true,true],[false,true,false,true,true,true,false,true]]
  },
  '5v9': {
    us: Array(5).fill(Array(8).fill(true)),
    opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '5v10': {
    us: Array(5).fill(Array(8).fill(true)),
    opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '6v6': {
    us: [[true,true,false,true,true,true,true,true],[false,true,true,true,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,false,true],[true,false,true,true,true,true,true,false]],
    opponent: [[true,true,false,true,true,true,true,true],[false,true,true,true,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,false,true],[true,false,true,true,true,true,true,false]]
  },
  '6v7': {
    us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false]],
    opponent: [[true,true,true,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,false,true,true,true,true,true,true],[true,true,false,false,true,true,true,true],[true,true,true,true,true,false,true,false],[true,true,true,true,true,true,true,false],[true,false,true,false,true,true,true,false]]
  },
  '6v8': {
    us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,false,true,true,true,true,true,true],[true,true,true,false,true,true,true,true],[true,true,true,true,true,false,true,true],[true,true,true,true,true,true,true,false]],
    opponent: [[true,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,false,true,true,true,false],[false,true,true,true,false,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,false,true,true],[false,true,false,true,true,true,false,true]]
  },
  '6v9': {
    us: [[false,true,true,true,true,true,false,true],[true,true,false,true,true,true,true,false],[true,true,true,true,false,true,true,true],[true,true,true,false,true,true,true,true],[true,false,true,true,true,true,true,true],[true,true,true,true,true,false,true,true]],
    opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '6v10': { 
    us: [[false,true,true,true,true,true,false,true],[true,false,true,true,true,true,true,false],[true,true,false,true,true,true,true,true],[true,true,true,false,true,true,true,true],[true,true,true,true,false,true,true,true],[true,true,true,true,true,false,true,true]],
    opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '7v7': {
    us: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false]],
    opponent: [[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,false,true,true,true,false,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false]]
  },
  '7v8': {
    us: [[false,true,false,true,false,true,true,true],[false,true,false,true,true,true,false,true],[true,true,true,true,false,true,true,false],[true,false,true,true,true,false,true,true],[true,true,true,false,true,true,true,false],[true,true,true,false,true,true,false,true],[true,false,true,true,true,false,true,true]],
    opponent: [[false,true,false,true,false,true,true,true],[false,true,false,true,true,true,false,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,false,true],[true,false,true,true,true,false,true,false],[true,true,true,false,true,false,true,false],[true,false,true,false,true,false,true,true],[true,false,true,false,true,true,true,false]]
  },
  '7v9': {
    us: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,true,true],[true,true,true,false,true,false,true,true],[true,false,true,true,true,true,false,true],[true,true,true,true,false,true,true,false],[true,true,false,true,true,true,true,false]],
    opponent: [[false,true,false,true,true,true,false,true],[true,false,true,false,true,false,true,true],[false,true,true,true,false,true,false,true],[true,true,false,true,false,true,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '7v10': {
    us: [[false,true,true,true,true,true,false,true],[true,true,false,true,true,false,true,false],[true,false,true,true,false,true,true,true],[true,true,true,false,true,true,true,false],[false,true,true,true,false,true,true,true],[true,false,true,true,true,false,true,true],[true,true,false,true,true,true,false,true]],
    opponent: [[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false]]
  },
  '8v8': { 
    us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]],
    opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]]
  },
  '8v9': {
    us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,false,true,false,true,false,true,true],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,true,true,false,true,false,true,false]],
    opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]]
  },
  '8v10': { 
    us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true]],
    opponent: [[true,false,false,true,false,true,false,true],[false,true,true,false,false,true,false,true],[false,true,false,true,true,false,false,true],[false,true,false,true,false,true,true,false],[false,true,false,true,false,true,false,true],[false,true,true,false,true,false,true,false],[true,false,false,true,true,false,true,false],[true,false,true,false,false,true,true,false],[true,false,true,false,true,false,false,true],[true,false,true,false,true,false,true,false]]
  },
  '9v9': {
    us: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]],
    opponent: [[true,true,false,true,false,true,false,true],[false,true,true,true,false,true,false,true],[false,true,false,true,true,true,false,true],[false,true,false,true,false,true,true,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]]
  },
  '9v10': { 
    us: [[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,true,true,false,true,false,true,false],[true,false,true,true,true,false,true,false],[true,false,true,false,true,true,true,false],[true,false,true,false,true,false,true,true],[true,false,true,false,true,false,true,false]],
    opponent: [[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[false,true,false,true,false,true,false,true],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false],[true,false,true,false,true,false,true,false]]
  },
};

// Default Roster Setup
const defaultNames = ["Brody", "Keller", "Danny", "Josh", "Sam", "Ben", "Mason", "Malcolm", "Jimmy"];
const initialRoster = Array.from({ length: 9 }, (_, i) => ({
  rank: i + 1,
  name: defaultNames[i],
  isPresent: false,
}));

let app, db, auth;

  useEffect(() => {
    if (!firebaseConfig) {
      setIsAuthReady(true);
      return;
    }
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          const signIn = async () => {
            try {
              if (initialAuthToken) {
                const credential = await signInWithCustomToken(auth, initialAuthToken);
                setUserId(credential.user.uid);
              } else {
                const credential = await signInAnonymously(auth);
                setUserId(credential.user.uid);
              }
            } catch (error) {
              setUserId(crypto.randomUUID());
            } finally {
              setIsAuthReady(true);
            }
          };
          signIn();
        }
      });
      return () => unsubscribe();
    } catch (e) {
      setIsAuthReady(true);
      setUserId(crypto.randomUUID());
    }
  }, []);

  return { db, userId, isAuthReady };
};

const useRoster = () => {
  // 1. Initialize roster from LocalStorage (or use default if empty)
  const [roster, setRoster] = useState(() => {
    const saved = localStorage.getItem('basketball-roster');
    return saved ? JSON.parse(saved) : initialRoster;
  });

  // 2. Automatically save to LocalStorage whenever the roster changes
  useEffect(() => {
    localStorage.setItem('basketball-roster', JSON.stringify(roster));
  }, [roster]);

  const updatePlayerName = (rank, newName) => {
    setRoster(prev => prev.map(p => p.rank === rank ? { ...p, name: newName } : p));
  };

  const togglePlayerAttendance = (rank) => {
    setRoster(prev => prev.map(p => p.rank === rank ? { ...p, isPresent: !p.isPresent } : p));
  };

  const presentPlayerCount = roster.filter(p => p.isPresent).length;

  return { roster, updatePlayerName, togglePlayerAttendance, presentPlayerCount };
};

  const saveRoster = useCallback(async (currentRoster, lastMatrixKey = null) => {
    if (!rosterDocRef) return;
    try {
      const dataToSave = { players: currentRoster };
      if (lastMatrixKey) dataToSave.lastMatrixKey = lastMatrixKey;
      await setDoc(rosterDocRef, dataToSave, { merge: true });
    } catch (e) {
      console.error("Error saving roster:", e);
    }
  }, [rosterDocRef]);

  useEffect(() => {
    if (!rosterDocRef || !isAuthReady) {
      if (roster === null) setRoster(initialRoster);
      return;
    }
    const unsubscribe = onSnapshot(rosterDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().players) {
        const loadedData = docSnap.data();
        const mergedRoster = initialRoster.map((defaultPlayer) => {
          const loadedPlayer = loadedData.players.find(p => p.rank === defaultPlayer.rank);
          return {
            ...defaultPlayer,
            name: loadedPlayer?.name ?? defaultPlayer.name,
            isPresent: loadedPlayer?.isPresent ?? defaultPlayer.isPresent,
          };
        });
        setRoster(mergedRoster);
        if (isInitialLoad) setIsInitialLoad(false);
      } else if (isAuthReady && isInitialLoad && !docSnap.exists()) {
        setRoster(initialRoster);
        saveRoster(initialRoster);
        setIsInitialLoad(false);
      } else if (roster === null) {
        setRoster(initialRoster);
      }
    }, () => {
      if (roster === null) setRoster(initialRoster);
    });
    return () => unsubscribe();
  }, [rosterDocRef, isAuthReady, isInitialLoad, saveRoster]);

  const updatePlayerName = useCallback((rank, newName) => {
    setRoster(prev => {
      const currentRoster = prev || initialRoster;
      const newRoster = currentRoster.map(p => p.rank === rank ? { ...p, name: newName } : p);
      saveRoster(newRoster);
      return newRoster;
    });
  }, [saveRoster]);

  const togglePlayerAttendance = useCallback((rank) => {
    setRoster(prev => {
      const currentRoster = prev || initialRoster;
      const newRoster = currentRoster.map(p => p.rank === rank ? { ...p, isPresent: !p.isPresent } : p);
      saveRoster(newRoster);
      return newRoster;
    });
  }, [saveRoster]);

  return { roster: roster || initialRoster, updatePlayerName, togglePlayerAttendance, presentPlayerCount: (roster || initialRoster).filter(p => p.isPresent).length, saveRoster };
};

const useMatrix = (roster) => {
  const [opponentCount, setOpponentCount] = useState(8);

  // 1. Calculate the player count more robustly
  const usCount = useMemo(() => {
    return Array.isArray(roster) ? roster.filter(p => p.isPresent).length : 0;
  }, [roster]);

  // 2. Add debugging and safety to the matrix selection
  const currentMatrix = useMemo(() => {
    if (usCount === 0) return null; // Don't try to render if no one is checked in

    const canonical = getCanonicalKey(usCount, opponentCount);
    // Ensure we handle both string and object returns from getCanonicalKey
    const key = typeof canonical === 'string' ? canonical : canonical.canonicalKey;
    
    // Safety check: if the key doesn't exist, log it so you can see it in F12
    if (!DEFAULT_MATRICES[key]) {
      console.warn(`Matrix key "${key}" not found in DEFAULT_MATRICES`);
      return null;
    }

    return DEFAULT_MATRICES[key];
  }, [usCount, opponentCount]);

  return { currentMatrix, opponentCount, setOpponentCount };
};

  const loadMatrix = useCallback(async (key, needsFlip = false) => {
    if (!db || !roster) return;
    const tempDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'matrices', key);
    const keyParts = key.split('v');
    const usCount = roster.filter(p => p.isPresent).length;
    const oppPlayersInMatrix = parseInt(keyParts[1] || 0);

    try {
      const docSnap = await getDoc(tempDocRef);
      let matrixData;
      if (docSnap.exists() && docSnap.data().usRotation) {
        matrixData = {
          periods: docSnap.data().periods,
          usRotation: JSON.parse(docSnap.data().usRotation),
          opponentRotation: JSON.parse(docSnap.data().opponentRotation),
          opponentNames: JSON.parse(docSnap.data().opponentNames || '[]'),
        };
      } else {
        const defaultMatrix = DEFAULT_MATRICES[key];
        if (defaultMatrix) {
          matrixData = {
            usRotation: defaultMatrix.us.slice(0, parseInt(keyParts[0])),
            opponentRotation: defaultMatrix.opponent.slice(0, oppPlayersInMatrix),
            periods: 8,
            opponentNames: Array.from({ length: oppPlayersInMatrix }, (_, i) => `Player ${i + 1}`),
          };
          await setDoc(tempDocRef, {
            periods: matrixData.periods,
            usRotation: JSON.stringify(matrixData.usRotation),
            opponentRotation: JSON.stringify(matrixData.opponentRotation),
            opponentNames: JSON.stringify(matrixData.opponentNames),
          }, { merge: true });
        } else return;
      }

      if (needsFlip) {
        const origUs = matrixData.usRotation;
        const origOpp = matrixData.opponentRotation;
        matrixData.usRotation = origOpp.slice(0, usCount);
        matrixData.opponentRotation = origUs.slice(0, oppPlayersInMatrix);
      } else {
        matrixData.usRotation = matrixData.usRotation.slice(0, usCount);
      }
      
      setCurrentMatrix(matrixData);
      setOpponentNames(matrixData.opponentNames.slice(0, matrixData.opponentRotation.length));
    } catch (e) {
      console.error("Error loading matrix:", e);
    }
  }, [db, roster]);

  const handleSetOpponentCount = useCallback((newCount) => {
    setOpponentCount(newCount);
    const usCount = roster.filter(p => p.isPresent).length;
    const check = getCanonicalKey(usCount, newCount);
    const newKey = typeof check === 'string' ? check : check.canonicalKey;
    if (roster && saveRoster) saveRoster(roster, newKey);
  }, [roster, saveRoster]);

  useEffect(() => {
    if (!isAuthReady || !db || !roster) return;
    const usCount = roster.filter(p => p.isPresent).length;
    if (usCount === 0) { setMatrixKey('0v0'); return; }
    const check = getCanonicalKey(usCount, opponentCount);
    const keyToLoad = typeof check === 'string' ? check : check.canonicalKey;
    const flip = typeof check !== 'string' && check.needsFlip;
    setMatrixKey(keyToLoad);
    loadMatrix(keyToLoad, flip);
  }, [isAuthReady, opponentCount, loadMatrix, db, roster]);

  const updateOpponentName = useCallback((index, newName) => {
    if (!currentMatrix) return;
    const newNames = [...opponentNames];
    newNames[index] = newName;
    const newMatrix = { ...currentMatrix, opponentNames: newNames };
    setOpponentNames(newNames);
    setDoc(matrixDocRef, {
      ...newMatrix,
      usRotation: JSON.stringify(newMatrix.usRotation),
      opponentRotation: JSON.stringify(newMatrix.opponentRotation),
      opponentNames: JSON.stringify(newNames)
    });
  }, [currentMatrix, opponentNames, matrixDocRef]);

  const updateMatrixCell = useCallback((team, pIdx, prIdx, val) => {
    if (!currentMatrix || !isEditMode) return;
    const newMatrix = { ...currentMatrix };
    if (team === 'us') {
      newMatrix.usRotation = newMatrix.usRotation.map((row, i) => i === pIdx ? row.map((c, j) => j === prIdx ? val : c) : row);
    } else {
      newMatrix.opponentRotation = newMatrix.opponentRotation.map((row, i) => i === pIdx ? row.map((c, j) => j === prIdx ? val : c) : row);
    }
    setCurrentMatrix(newMatrix);
    setDoc(matrixDocRef, {
      ...newMatrix,
      usRotation: JSON.stringify(newMatrix.usRotation),
      opponentRotation: JSON.stringify(newMatrix.opponentRotation),
      opponentNames: JSON.stringify(opponentNames)
    });
  }, [currentMatrix, isEditMode, matrixDocRef, opponentNames]);

  return { currentMatrix, opponentCount, setOpponentCount: handleSetOpponentCount, matrixKey, isEditMode, toggleEditMode: () => setIsEditMode(!isEditMode), updateMatrixCell, opponentNames, updateOpponentName };
};

// --- Components ---

const Navigation = ({ currentPage, setCurrentPage }) => (
  <nav className="max-w-7xl mx-auto mb-8 bg-white shadow-xl rounded-xl p-3 flex flex-wrap justify-center gap-4 border-b-4 border-indigo-500">
    {['attendance', 'grid', 'roster'].map(id => (
      <button
        key={id}
        onClick={() => setCurrentPage(id)}
        className={`px-8 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${currentPage === id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
      >
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
        <button
          key={p.rank}
          onClick={() => togglePlayerAttendance(p.rank)}
          disabled={!p.name}
          className={`p-3 rounded-xl shadow font-semibold transition transform active:scale-95 ${!p.name ? 'bg-gray-200 text-gray-400' : p.isPresent ? 'bg-green-500 text-white ring-2 ring-green-600' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
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
          <input
            type="text"
            value={p.name}
            onChange={(e) => updatePlayerName(p.rank, e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      ))}
    </div>
  </div>
);

const PlayerMatrixGrid = ({ roster, presentPlayerCount, currentMatrix, matrixKey, setOpponentCount, opponentCount, isEditMode, toggleEditMode, updateMatrixCell, opponentNames, updateOpponentName }) => {
  const [curP, setCurP] = useState(null);
  const lineups = useMemo(() => {
    if (!currentMatrix?.usRotation?.length) return [];
    const res = [];
    const presRost = roster.filter(p => p.isPresent);
    for (let j = 0; j < 8; j++) {
      const h = [], o = [];
      for (let i = 0; i < currentMatrix.usRotation.length; i++) if (currentMatrix.usRotation[i]?.[j] && presRost[i]) h.push(presRost[i].name);
      for (let k = 0; k < currentMatrix.opponentRotation.length; k++) if (currentMatrix.opponentRotation[k]?.[j] && opponentNames[k]) o.push(opponentNames[k]);
      res.push({ p: j + 1, h, o });
    }
    return res;
  }, [currentMatrix, roster, opponentNames]);

  if (presentPlayerCount === 0) return <div className="text-center p-8 bg-white rounded-lg shadow-xl m-4"><p>Mark players as present in Check-In.</p></div>;

  const renderTbl = (rot, team) => {
    const rows = team === 'us' ? roster.filter(p => p.isPresent) : Array.from({ length: rot.length }, (_, i) => ({ rank: i + 1, name: opponentNames[i] || `Player ${i + 1}` }));
    return (
      <div className="overflow-x-scroll rounded-xl shadow-xl border border-gray-200">
        <table className="min-w-full bg-white table-fixed border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-30">
            <tr>
              <th className="px-1 py-2 text-xs font-bold text-gray-500 uppercase sticky left-0 z-40 bg-gray-100 border-r w-[90px]">TEAM</th>
              {Array.from({ length: 8 }, (_, i) => i + 1).map(p => <th key={p} className={`px-1 py-2 text-xs font-bold uppercase cursor-pointer ${curP === p ? 'bg-indigo-300' : 'text-gray-500'}`} onClick={() => setCurP(p)}>P{p}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((p, i) => (
              <tr key={i} className="hover:bg-indigo-50">
                <td className="py-2 text-xs font-bold sticky left-0 z-10 bg-white border-r text-center">
                  {team === 'us' ? <span className="text-sm truncate w-[80px] block mx-auto">{p.name}</span> : <input type="text" value={p.name} onChange={(e) => updateOpponentName(i, e.target.value)} className="w-full text-center text-sm outline-none bg-transparent" />}
                </td>
                {(rot[i] || []).map((on, j) => (
                  <td key={j} className={`px-1 py-2 text-center cursor-pointer ${curP === j + 1 ? 'bg-indigo-100' : ''}`} onClick={() => isEditMode && updateMatrixCell(team, i, j, !on)}>
                    <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-white font-bold border-2 ${on ? 'bg-green-500 border-green-600' : isEditMode ? 'bg-red-100 border-red-300 text-red-500' : 'bg-gray-100 border-gray-300'}`}>{on ? 'X' : ''}</div>
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
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-extrabold text-indigo-700">Rotation Grid</h2>
        <button onClick={toggleEditMode} className={`px-4 py-1 text-sm rounded-full font-bold ${isEditMode ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>{isEditMode ? 'Lock Grid' : 'Edit Toggle'}</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
        <div><label className="text-xs font-bold text-gray-500">PRESENT</label><div className="text-xl font-bold text-indigo-700">{presentPlayerCount} Players</div></div>
        <div className="text-center"><label className="text-xs font-bold text-gray-500">OPPONENTS</label><div className="flex gap-1 mt-1">{[10,9,8,7,6,5].map(c => <button key={c} onClick={() => setOpponentCount(c)} className={`w-8 h-8 rounded font-bold text-sm border-2 ${opponentCount === c ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-indigo-200'}`}>{c}</button>)}</div></div>
        <div><label className="text-xs font-bold text-gray-500">MATCHUP</label><div className="text-lg font-bold text-indigo-700">{matrixKey.toUpperCase()}</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div><h3 className="text-md font-bold mb-2 text-gray-700 ml-2">Your Team</h3>{renderTbl(currentMatrix.usRotation, 'us')}</div>
        <div><h3 className="text-md font-bold mb-2 text-gray-700 ml-2">Opponents</h3>{renderTbl(currentMatrix.opponentRotation, 'opponent')}</div>
      </div>
      <div className="mt-10">
        <h3 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">Lineup Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {lineups.map(l => (
            <div key={l.p} onClick={() => setCurP(curP === l.p ? null : l.p)} className={`bg-white p-3 rounded-lg border-2 transition cursor-pointer text-center ${curP === l.p ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-gray-100'}`}>
              <div className="font-extrabold text-indigo-600 mb-1">P{l.p}</div>
              <div className="min-h-[2rem] text-xs font-bold text-gray-800 leading-tight">{l.h.join(', ') || '---'}</div>
              <div className="text-[10px] text-gray-400 my-1">vs</div>
              <div className="min-h-[2rem] text-xs text-gray-600 leading-tight">{l.o.join(', ') || '---'}</div>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-8 pt-6 border-t border-gray-100 text-center'>
        <h2 className="text-lg font-bold text-gray-800 mb-2">App Info</h2>
        <p className='text-xs text-gray-600 max-w-2xl mx-auto'>Rotation matrices load automatically based on attendance. Matchup data is shared publicly, while your roster names are private.</p>
      </div>
    </div>
  );
};

const App = () => {
  const { db, userId, isAuthReady } = useFirebase();
  const { roster, updatePlayerName, togglePlayerAttendance, presentPlayerCount, saveRoster } = useRoster(db, userId, isAuthReady);
  const matrixProps = useMatrix(db, userId, isAuthReady, roster, saveRoster);
  const [page, setPage] = useState('attendance');

  if (!isAuthReady || roster === null) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-center">
      <div className="text-indigo-600 text-4xl mb-4 animate-spin font-bold">↻</div>
      <p className="text-xl font-semibold text-gray-700">Loading App Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-800">Rotation Matrix Tool</h1>
        <p className="text-md text-gray-600 mt-2">View and edit game rotations dynamically.</p>
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
