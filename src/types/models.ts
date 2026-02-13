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
}

export type PlayStatus = 'PLAY' | 'SIT';

export interface RotationRow {
  player: Player;
  statuses: PlayStatus[];
}
