export interface Brick {
  id: bigint;
  x: number;
  y: number;
  status: number;
  hitsRequired: number;
  currentHits: number;
  color: string;
  hasPowerUp: boolean;
  powerUpType?: "MULTI_BALL" | "WIDE_PADDLE";
}

export function createBricks(brickColumnCount: number, brickRowCount: number, level: number): Brick[][] {
  const bricks: Brick[][] = [];
  let brickIdCounter = BigInt(1);

  // Calculate hits required based on level
  const baseHits = 1;
  const hitsRequired = Math.min(baseHits + Math.floor(level / 2), 5); // Max 5 hits required

  // Define colors based on hits required
  const colors = {
    1: "#FF0000", // Red
    2: "#FFA500", // Orange
    3: "#FFFF00", // Yellow
    4: "#00FF00", // Green
    5: "#0000FF", // Blue
  };

  // Power-up probability increases with level
  const powerUpProbability = Math.min(0.1 + (level - 1) * 0.05, 0.3); // Max 30% chance

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      // Randomize hits required for each brick
      const brickHits = Math.floor(Math.random() * hitsRequired) + 1;

      // Randomly assign power-ups
      const hasPowerUp = Math.random() < powerUpProbability;
      const powerUpType = hasPowerUp ? (Math.random() < 0.5 ? "MULTI_BALL" : "WIDE_PADDLE") : undefined;

      bricks[c][r] = {
        id: brickIdCounter,
        x: 0,
        y: 0,
        status: 1,
        hitsRequired: brickHits,
        currentHits: 0,
        color: colors[brickHits as keyof typeof colors],
        hasPowerUp,
        powerUpType,
      };
      brickIdCounter++;
    }
  }
  return bricks;
}
