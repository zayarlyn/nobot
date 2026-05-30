export const COLS = 24;
export const ROWS = 15;
export const TILE = 40;
export const W = COLS * TILE;
export const H = ROWS * TILE;

export const RACKS = [
  { x: 5, y: 3, w: 2, h: 3 },
  { x: 17, y: 3, w: 2, h: 3 },
  { x: 11, y: 6, w: 3, h: 2 },
  { x: 5, y: 9, w: 2, h: 3 },
  { x: 17, y: 9, w: 2, h: 3 },
  { x: 10, y: 11, w: 2, h: 2 },
];

export function buildGrid(): number[][] {
  const g: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: number[] = [];
    for (let x = 0; x < COLS; x++) {
      const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      row.push(border ? 1 : 0);
    }
    g.push(row);
  }
  RACKS.forEach((r) => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) g[y][x] = 1;
  });
  return g;
}

export interface MonitorPost {
  name: string;
  handle: string;
  av: string;
  body?: string;
  imageUrl?: string;
  topic: string;
  kind: 'human' | 'ai';
  tells: string[];
  custom?: boolean;
}

export function buildPool(apiPosts: MonitorPost[]): { subs: MonitorPost[]; defaults: MonitorPost[] } {
  return {
    subs: apiPosts.map((p) => ({ ...p, custom: true })),
    defaults: [],
  };
}

export const SPOTS: [number, number][] = [
  // [3, 2],
  // [12, 2],
  // [21, 2],
  // [9, 4],
  // [15, 4],
  // [2, 8],
  // [22, 8],
  [12, 9],
  // [4, 13],
  // [20, 13],
];

export const PLAYER_SPAWN = { tx: 12, ty: 13 };
