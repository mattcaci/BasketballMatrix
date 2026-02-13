import type { Player, RotationRow } from '../types/models';
import { userMatrices, type UserMatrix } from './userMatrices';

export interface MatrixSelectionResult {
  canonicalKey: string;
  usedOppGrid: boolean;
  grid: boolean[][] | null;
  error?: string;
}

export function getCanonicalKey(ourCount: number, oppCount: number): string {
  return `${Math.min(ourCount, oppCount)}v${Math.max(ourCount, oppCount)}`;
}

export function getAvailableMatrixKeys(): string[] {
  return Object.keys(userMatrices).sort((a, b) => {
    const [a1, a2] = a.split('v').map(Number);
    const [b1, b2] = b.split('v').map(Number);
    return a1 - b1 || a2 - b2;
  });
}

export function validateMatrixDimensions(key: string, matrix: UserMatrix): string[] {
  const [usCount, oppCount] = key.split('v').map(Number);
  const errors: string[] = [];

  if (matrix.us.length !== usCount) {
    errors.push(`${key}: us row count ${matrix.us.length} does not match ${usCount}`);
  }
  if (matrix.opponent.length !== oppCount) {
    errors.push(`${key}: opponent row count ${matrix.opponent.length} does not match ${oppCount}`);
  }

  matrix.us.forEach((row, idx) => {
    if (row.length !== 8) {
      errors.push(`${key}: us row ${idx + 1} has ${row.length} periods (expected 8)`);
    }
  });

  matrix.opponent.forEach((row, idx) => {
    if (row.length !== 8) {
      errors.push(`${key}: opponent row ${idx + 1} has ${row.length} periods (expected 8)`);
    }
  });

  return errors;
}

export function selectMatrixGrid(ourCount: number, oppCount: number): MatrixSelectionResult {
  const canonicalKey = getCanonicalKey(ourCount, oppCount);
  const matrix = userMatrices[canonicalKey];

  if (!matrix) {
    return {
      canonicalKey,
      usedOppGrid: false,
      grid: null,
      error: `No matrix for ${canonicalKey}`
    };
  }

  const validationErrors = validateMatrixDimensions(canonicalKey, matrix);
  if (validationErrors.length > 0) {
    return {
      canonicalKey,
      usedOppGrid: false,
      grid: null,
      error: validationErrors.join('; ')
    };
  }

  const minCount = Math.min(ourCount, oppCount);
  const usedOppGrid = ourCount !== minCount;

  return {
    canonicalKey,
    usedOppGrid,
    grid: usedOppGrid ? matrix.opponent : matrix.us
  };
}

export function buildRotationRows(playersByRank: Player[], grid: boolean[][]): RotationRow[] {
  return playersByRank.map((player, index) => ({
    player,
    statuses: (grid[index] ?? Array.from({ length: 8 }, () => false)).map((value) => (value ? 'PLAY' : 'SIT'))
  }));
}
