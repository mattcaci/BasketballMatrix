import templatesRaw from './templates.json';
import type { PlayStatus, Player, RotationMatrixTemplate, RotationRow } from '../types/models';

const templates = templatesRaw as RotationMatrixTemplate[];

export function getMatrixKey(ourPresentCount: number, opponentCount: number): string {
  return `${ourPresentCount}v${opponentCount}`;
}

export function getTemplateByKey(key: string): RotationMatrixTemplate | undefined {
  return templates.find((template) => template.key === key);
}

export function listTemplates(): RotationMatrixTemplate[] {
  return templates;
}

export function validateTemplate(template: RotationMatrixTemplate): string[] {
  const errors: string[] = [];
  if (template.periods !== 8) {
    errors.push(`${template.key}: periods must equal 8`);
  }

  for (const [rank, statuses] of Object.entries(template.rules)) {
    const parsedRank = Number(rank);
    if (!Number.isInteger(parsedRank) || parsedRank < 1 || parsedRank > 10) {
      errors.push(`${template.key}: invalid rank ${rank}`);
    }

    if (statuses.length !== 8) {
      errors.push(`${template.key}: rank ${rank} must contain 8 statuses`);
    }

    statuses.forEach((status, idx) => {
      if (status !== 'PLAY' && status !== 'SIT') {
        errors.push(`${template.key}: rank ${rank} has invalid status ${status} at period ${idx + 1}`);
      }
    });
  }

  if (new Set(Object.keys(template.rules)).size !== Object.keys(template.rules).length) {
    errors.push(`${template.key}: duplicate rank entries`);
  }

  return errors;
}

export function validateAllTemplates(): string[] {
  return templates.flatMap(validateTemplate);
}

export function buildRotationRows(players: Player[], template: RotationMatrixTemplate): RotationRow[] {
  return players.map((player) => {
    const statuses = template.rules[String(player.rank)] || Array<PlayStatus>(8).fill('SIT');
    return { player, statuses };
  });
}

export function getTemplateHints(ourPresentCount: number, opponentCount: number): string[] {
  return templates
    .filter((template) => {
      const [our, opp] = template.key.split('v').map(Number);
      return our === ourPresentCount || opp === opponentCount;
    })
    .map((template) => template.key);
}
