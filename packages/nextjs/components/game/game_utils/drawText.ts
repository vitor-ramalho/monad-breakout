export function drawText(ctx: CanvasRenderingContext2D, textProps: any, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${textProps.fontSize}px Arial`;
  ctx.fillStyle = textProps.color;
  ctx.textAlign = "center";
  ctx.fillText(textProps.text, textProps.x, textProps.y);

  textProps.x += textProps.dx;
  textProps.y += textProps.dy;

  if (
    textProps.x + ctx.measureText(textProps.text).width / 2 > canvas.width ||
    textProps.x - ctx.measureText(textProps.text).width / 2 < 0
  ) {
    textProps.dx = -textProps.dx;
  }

  if (textProps.y + textProps.fontSize / 2 > canvas.height || textProps.y - textProps.fontSize / 2 < 0) {
    textProps.dy = -textProps.dy;
  }
}
