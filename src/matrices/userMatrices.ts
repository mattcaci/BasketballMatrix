export interface UserMatrix {
  us: boolean[][];
  opponent: boolean[][];
}

export const userMatrices: Record<string, UserMatrix> = {
  '5v5': {
    us: Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => true)),
    opponent: Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => true))
  },
  '5v6': {
    us: Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => true)),
    opponent: [
      [true, true, true, false, true, true, true, false],
      [true, true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true, true],
      [false, true, true, true, false, true, true, true],
      [true, true, true, false, true, true, true, false],
      [true, true, false, true, true, true, false, true]
    ]
  },
  '6v7': {
    us: Array.from({ length: 6 }, () => Array.from({ length: 8 }, () => true)),
    opponent: [
      [true, true, false, true, true, false, true, true],
      [true, false, true, true, false, true, true, true],
      [false, true, true, false, true, true,true, true],
      [true, true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true, true],
      [false, true, true, true, false, true, true, true],
      [true, true, true, false, true, true, false, true]
    ]
  },
  '7v7': {
    us: Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => true)),
    opponent: Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => true))
  },
  '7v8': {
    us: Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => true)),
    opponent: [
      [true, true, true, false, true, true, true, false],
      [true, true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true, true],
      [false, true, true, true, false, true, true, true],
      [true, true, true, false, true, true, true, false],
      [true, true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true, true],
      [false, true, true, true, false, true, true, true]
    ]
  },
  '10v10': {
    us: Array.from({ length: 10 }, () => Array.from({ length: 8 }, () => true)),
    opponent: Array.from({ length: 10 }, () => Array.from({ length: 8 }, () => true))
  }
};
