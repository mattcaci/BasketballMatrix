export interface Player {
  id: string;
  name: string;
  jerseyNumber?: string;
  rank: number;
  active: boolean;
}

export interface GameSession {
  id: string;
  dateTime: string;
  opponentCount: number;
  presentPlayerIds: string[];
  selectedMatrixKey: string;
  notes?: string;
  currentPeriod: number;
  lockRosterOrder?: boolean;
}

export type PlayStatus = 'PLAY' | 'SIT';

export interface RotationMatrixTemplate {
  key: string;
  periods: number;
  rules: Record<string, PlayStatus[]>;
}

export interface RotationRow {
  player: Player;
  statuses: PlayStatus[];
}
