import { openDB } from 'idb';
import type { GameSession, Player } from '../types/models';

interface AppData {
  roster: Player[];
  lastSession: GameSession | null;
  sessionHistory: GameSession[];
}

const DB_NAME = 'player-rotation-matrix-db';
const STORE = 'app';
const KEY = 'state';

const defaultPlayers: Player[] = [
  { id: crypto.randomUUID(), name: 'Player 1', rank: 1, active: true },
  { id: crypto.randomUUID(), name: 'Player 2', rank: 2, active: true },
  { id: crypto.randomUUID(), name: 'Player 3', rank: 3, active: true },
  { id: crypto.randomUUID(), name: 'Player 4', rank: 4, active: true },
  { id: crypto.randomUUID(), name: 'Player 5', rank: 5, active: true }
];

const initialData: AppData = {
  roster: defaultPlayers,
  lastSession: null,
  sessionHistory: []
};

async function readFromIndexedDB(): Promise<AppData | null> {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(dbInstance) {
        if (!dbInstance.objectStoreNames.contains(STORE)) {
          dbInstance.createObjectStore(STORE);
        }
      }
    });

    const data = await db.get(STORE, KEY);
    return (data as AppData | undefined) ?? null;
  } catch {
    return null;
  }
}

async function writeToIndexedDB(data: AppData): Promise<boolean> {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(dbInstance) {
        if (!dbInstance.objectStoreNames.contains(STORE)) {
          dbInstance.createObjectStore(STORE);
        }
      }
    });
    await db.put(STORE, data, KEY);
    return true;
  } catch {
    return false;
  }
}

function readFromLocalStorage(): AppData | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

function writeToLocalStorage(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadData(): Promise<AppData> {
  const indexed = await readFromIndexedDB();
  if (indexed) return indexed;

  const fallback = readFromLocalStorage();
  return fallback ?? initialData;
}

export async function saveData(data: AppData): Promise<void> {
  const saved = await writeToIndexedDB(data);
  if (!saved) {
    writeToLocalStorage(data);
  }
}

export type { AppData };
