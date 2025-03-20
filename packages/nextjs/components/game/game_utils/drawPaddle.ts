export interface Paddle {
  width: number;
  height: number;
  x: number;
  y: number;
  dx: number;
}

export function drawPaddle(ctx: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement | null, paddle: Paddle) {
  if (!ctx) return;
  ctx.fillStyle = "#0095DD";
  if (canvas) {
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }
}
