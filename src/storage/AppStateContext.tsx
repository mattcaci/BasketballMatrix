import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadData, saveData, type AppData } from './persistence';
import type { GameSession, Player } from '../types/models';
import { getCanonicalKey } from '../matrices/matrixUtils';

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
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

function createSession(players: Player[]): GameSession {
  const presentCount = players.filter((player) => player.active).length;
  return {
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    opponentCount: 5,
    presentPlayerIds: players.filter((player) => player.active).map((player) => player.id),
    selectedMatrixKey: getCanonicalKey(presentCount, 5),
    notes: '',
    currentPeriod: 1
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadData().then((loaded) => {
      const session = loaded.lastSession ?? createSession(loaded.roster);
      session.selectedMatrixKey = getCanonicalKey(session.presentPlayerIds.length, session.opponentCount);
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
        setCurrentPeriod: () => undefined
      };
    }

    const setPlayers = (players: Player[]) => {
      setData((prev) => {
        if (!prev || !prev.lastSession) return prev;

        const validIds = new Set(players.map((player) => player.id));
        const present = prev.lastSession.presentPlayerIds.filter((id) => validIds.has(id));

        return {
          ...prev,
          roster: players,
          lastSession: {
            ...prev.lastSession,
            presentPlayerIds: present,
            selectedMatrixKey: getCanonicalKey(present.length, prev.lastSession.opponentCount)
          }
        };
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
            selectedMatrixKey: getCanonicalKey(presentPlayerIds.length, prev.lastSession.opponentCount)
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
        session.selectedMatrixKey = getCanonicalKey(0, session.opponentCount);
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
            selectedMatrixKey: getCanonicalKey(prev.lastSession.presentPlayerIds.length, count)
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

    return {
      players: data.roster,
      session: data.lastSession,
      history: data.sessionHistory,
      loading: false,
      setPlayers,
      toggleAttendance,
      newGame,
      setOpponentCount,
      setCurrentPeriod
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
