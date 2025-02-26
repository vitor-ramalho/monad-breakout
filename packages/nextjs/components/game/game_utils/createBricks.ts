export interface Brick {
  id: bigint;
  x: number;
  y: number;
  status: number;
}

export function createBricks(brickColumnCount: number, brickRowCount: number): Brick[][] {
  const bricks: Brick[][] = [];
  let brickIdCounter = BigInt(1);
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { id: brickIdCounter, x: 0, y: 0, status: 1 };
      brickIdCounter++;
    }
  }
  return bricks;
}
