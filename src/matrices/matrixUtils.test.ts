import { describe, expect, it } from 'vitest';
import { getMatrixKey, getTemplateByKey, validateAllTemplates, getTemplateHints } from './matrixUtils';

describe('matrix selection', () => {
  it('creates matchup key from attendance and opponent count', () => {
    expect(getMatrixKey(7, 6)).toBe('7v6');
  });

  it('loads template by computed key', () => {
    const template = getTemplateByKey('7v6');
    expect(template?.periods).toBe(8);
    expect(template?.rules['1']).toHaveLength(8);
  });

  it('validates seeded templates', () => {
    expect(validateAllTemplates()).toEqual([]);
  });

  it('offers nearby hints when template missing', () => {
    const hints = getTemplateHints(9, 7);
    expect(hints).toContain('8v7');
  });
});
