import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadData, saveData, type AppData } from './persistence';
import type { GameSession, Player } from '../types/models';
import { getMatrixKey } from '../matrices/matrixUtils';

interface AppStateValue {
  players: Player[];
  session: GameSession;
  history: GameSession[];
  loading: boolean;
  setPlayers: (players: Player[]) => void;
  toggleAttendance: (playerId: string) => void;
  newGame: () => void;
  setOpponentCount: (count: number) => void;
  setCurrentPeriod: (period: number) => void;
  setLockRosterOrder: (locked: boolean) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function createSession(players: Player[]): GameSession {
  return {
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    opponentCount: 5,
    presentPlayerIds: players.filter((player) => player.active).map((player) => player.id),
    selectedMatrixKey: getMatrixKey(players.filter((p) => p.active).length, 5),
    notes: '',
    currentPeriod: 1,
    lockRosterOrder: false
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadData().then((loaded) => {
      const session = loaded.lastSession ?? createSession(loaded.roster);
      setData({ ...loaded, lastSession: session });
    });
  }, []);

  useEffect(() => {
    if (data) {
      void saveData(data);
    }
  }, [data]);

  const value = useMemo<AppStateValue>(() => {
    if (!data || !data.lastSession) {
      return {
        players: [],
        session: createSession([]),
        history: [],
        loading: true,
        setPlayers: () => undefined,
        toggleAttendance: () => undefined,
        newGame: () => undefined,
        setOpponentCount: () => undefined,
        setCurrentPeriod: () => undefined,
        setLockRosterOrder: () => undefined
      };
    }

    const setPlayers = (players: Player[]) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;

        const validIds = new Set(players.map((player) => player.id));
        const present = prev.lastSession.presentPlayerIds.filter((id) => validIds.has(id));

        const updatedSession = {
          ...prev.lastSession,
          presentPlayerIds: present,
          selectedMatrixKey: getMatrixKey(present.length, prev.lastSession.opponentCount)
        };

        return { ...prev, roster: players, lastSession: updatedSession };
      });
    };

    const toggleAttendance = (playerId: string) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;
        const isPresent = prev.lastSession.presentPlayerIds.includes(playerId);
        const presentPlayerIds = isPresent
          ? prev.lastSession.presentPlayerIds.filter((id) => id !== playerId)
          : [...prev.lastSession.presentPlayerIds, playerId];

        return {
          ...prev,
          lastSession: {
            ...prev.lastSession,
            presentPlayerIds,
            selectedMatrixKey: getMatrixKey(presentPlayerIds.length, prev.lastSession.opponentCount)
          }
        };
      });
    };

    const newGame = () => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;
        const updatedHistory = [prev.lastSession, ...prev.sessionHistory].slice(0, 10);
        const session = createSession(prev.roster);
        session.presentPlayerIds = [];
        session.selectedMatrixKey = getMatrixKey(0, session.opponentCount);
        return { ...prev, lastSession: session, sessionHistory: updatedHistory };
      });
    };

    const setOpponentCount = (count: number) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;
        return {
          ...prev,
          lastSession: {
            ...prev.lastSession,
            opponentCount: count,
            selectedMatrixKey: getMatrixKey(prev.lastSession.presentPlayerIds.length, count)
          }
        };
      });
    };

    const setCurrentPeriod = (period: number) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;
        return {
          ...prev,
          lastSession: { ...prev.lastSession, currentPeriod: Math.min(8, Math.max(1, period)) }
        };
      });
    };

    const setLockRosterOrder = (locked: boolean) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;
        return {
          ...prev,
          lastSession: { ...prev.lastSession, lockRosterOrder: locked }
        };
      });
    };

    return {
      players: data.roster,
      session: data.lastSession,
      history: data.sessionHistory,
      loading: false,
      setPlayers,
      toggleAttendance,
      newGame,
      setOpponentCount,
      setCurrentPeriod,
      setLockRosterOrder
    };
  }, [data]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return context;
}
