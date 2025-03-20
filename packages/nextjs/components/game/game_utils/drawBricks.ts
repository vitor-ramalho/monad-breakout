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
          // Draw brick base (darkest layer)
          ctx.fillStyle = '#8B4513'; // Dark brown base
          ctx.fillRect(brickX, brickY, brickWidth, brickHeight);

          // Draw brick texture lines
          ctx.strokeStyle = '#A0522D'; // Slightly lighter brown for lines
          ctx.lineWidth = 2;
          for (let i = 0; i < brickWidth; i += 10) {
            ctx.beginPath();
            ctx.moveTo(brickX + i, brickY);
            ctx.lineTo(brickX + i, brickY + brickHeight);
            ctx.stroke();
          }

          // Draw remaining layers based on hits
          const layerHeight = brickHeight / brick.hitsRequired;
          const remainingLayers = brick.hitsRequired - brick.currentHits;
          
          // Draw each remaining layer with a gradient effect
          for (let i = 0; i < remainingLayers; i++) {
            const layerY = brickY + (i * layerHeight);
            const gradient = ctx.createLinearGradient(
              brickX,
              layerY,
              brickX,
              layerY + layerHeight
            );
            
            // Create a gradient from lighter to darker shade
            const baseColor = brick.color;
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, '#8B4513');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(brickX, layerY, brickWidth, layerHeight);
          }

          // Add brick edge highlights
          ctx.strokeStyle = '#DEB887'; // Light brown for highlights
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(brickX, brickY);
          ctx.lineTo(brickX + brickWidth, brickY);
          ctx.lineTo(brickX + brickWidth, brickY + brickHeight);
          ctx.lineTo(brickX, brickY + brickHeight);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }
}
