import { describe, expect, it } from 'vitest';
import { getCanonicalKey, selectMatrixGrid, validateMatrixDimensions } from './matrixUtils';

describe('matrix selection', () => {
  it('builds canonical matchup key', () => {
    expect(getCanonicalKey(7, 6)).toBe('6v7');
    expect(getCanonicalKey(5, 10)).toBe('5v10');
  });

  it('chooses us grid when our count is the minimum side', () => {
    const selected = selectMatrixGrid(5, 6);
    expect(selected.canonicalKey).toBe('5v6');
    expect(selected.usedOppGrid).toBe(false);
    expect(selected.grid?.length).toBe(5);
  });

  it('chooses opponent grid when our count is the larger side', () => {
    const selected = selectMatrixGrid(6, 5);
    expect(selected.canonicalKey).toBe('5v6');
    expect(selected.usedOppGrid).toBe(true);
    expect(selected.grid?.length).toBe(6);
  });

  it('validates expected dimensions and period count', () => {
    const errors = validateMatrixDimensions('5v6', {
      us: [[true]],
      opponent: [Array.from({ length: 8 }, () => true)]
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});
