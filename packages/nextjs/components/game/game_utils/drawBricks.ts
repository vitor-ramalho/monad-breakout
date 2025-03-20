export function drawBricks(
  ctx: CanvasRenderingContext2D | null,
  bricks: any[][],
  brickProperties: {
    brickRowCount: number;
    brickColumnCount: number;
    brickWidth: number;
    brickHeight: number;
    brickPadding: number;
    brickOffsetTop: number;
    brickOffsetLeft: number;
  },
) {
  const { brickRowCount, brickColumnCount, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft } =
    brickProperties;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const brick = bricks[c][r];
      if (brick.status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        brick.x = brickX;
        brick.y = brickY;
        if (ctx) {
          // Draw brick with its color
          ctx.fillStyle = brick.color;
          ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
          
          // Draw hit progress
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${brick.currentHits}/${brick.hitsRequired}`,
            brickX + brickWidth / 2,
            brickY + brickHeight / 2 + 4
          );
        }
      }
    }
  }
}
