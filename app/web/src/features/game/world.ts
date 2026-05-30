export const COLS = 24;
export const ROWS = 15;
export const TILE = 40;
export const W = COLS * TILE;
export const H = ROWS * TILE;

export interface Rack { x: number; y: number; w: number; h: number; }

const RACK_SIZES: [number, number][] = [[2, 3], [3, 2], [2, 2], [3, 3], [2, 4], [4, 2]];

export function generateRacks(count = 6): Rack[] {
  const racks: Rack[] = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const [w, h] = RACK_SIZES[(Math.random() * RACK_SIZES.length) | 0];
      const x = 2 + ((Math.random() * (COLS - 4 - w)) | 0);
      const y = 2 + ((Math.random() * (ROWS - 4 - h)) | 0);
      const overlaps = racks.some(
        (r) => x < r.x + r.w + 2 && x + w + 2 > r.x && y < r.y + r.h + 2 && y + h + 2 > r.y
      );
      if (!overlaps) { racks.push({ x, y, w, h }); break; }
    }
  }
  return racks;
}

export function buildGrid(racks: Rack[]): number[][] {
  const g: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: number[] = [];
    for (let x = 0; x < COLS; x++) {
      row.push(x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 ? 1 : 0);
    }
    g.push(row);
  }
  racks.forEach((r) => {
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++)
        g[y][x] = 1;
  });
  return g;
}

export interface MonitorPost {
  id: number;
  name: string;
  handle: string;
  av: string;
  body?: string;
  imageUrl?: string;
  topic: string;
  tells: string[];
  custom?: boolean;
}

export function buildPool(apiPosts: MonitorPost[]): { subs: MonitorPost[]; defaults: MonitorPost[] } {
  return {
    subs: apiPosts.map((p) => ({ ...p, custom: true })),
    defaults: [],
  };
}

const MIN_SPOT_DIST = 2; // minimum tile distance between any two monitors

export function generateSpots(n: number, grid: number[][]): [number, number][] {
  const minX = 1, maxX = COLS - 2;
  const minY = 1, maxY = ROWS - 2;
  const playW = maxX - minX;
  const playH = maxY - minY;

  const cols = Math.ceil(Math.sqrt(n * (playW / playH)));
  const rows = Math.ceil(n / cols);
  const cellW = playW / cols;
  const cellH = playH / rows;

  const cells: [number, number][] = [];
  for (let cy = 0; cy < rows; cy++)
    for (let cx = 0; cx < cols; cx++)
      cells.push([cx, cy]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const placed: [number, number][] = [];
  const tooClose = (tx: number, ty: number) =>
    placed.some(([px, py]) => Math.abs(tx - px) < MIN_SPOT_DIST && Math.abs(ty - py) < MIN_SPOT_DIST);

  return cells.slice(0, n).map(([cx, cy]) => {
    for (let attempt = 0; attempt < 40; attempt++) {
      const tx = Math.min(maxX - 1, Math.floor(minX + cx * cellW + Math.random() * cellW));
      const ty = Math.min(maxY - 1, Math.floor(minY + cy * cellH + Math.random() * cellH));
      if (!grid[ty][tx] && !tooClose(tx, ty)) { placed.push([tx, ty]); return [tx, ty]; }
    }
    for (let tx = Math.floor(minX + cx * cellW); tx < Math.min(maxX, Math.floor(minX + (cx + 1) * cellW)); tx++)
      for (let ty = Math.floor(minY + cy * cellH); ty < Math.min(maxY, Math.floor(minY + (cy + 1) * cellH)); ty++)
        if (!grid[ty][tx] && !tooClose(tx, ty)) { placed.push([tx, ty]); return [tx, ty]; }
    const fb: [number, number] = [Math.floor(minX + cx * cellW + cellW / 2), Math.floor(minY + cy * cellH + cellH / 2)];
    placed.push(fb);
    return fb;
  });
}
