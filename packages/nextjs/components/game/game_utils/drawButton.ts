export interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  text: string;
}

export function drawButton(ctx: CanvasRenderingContext2D | null, button: Button) {
  if (!ctx) return;
  const {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    color: buttonColor,
    textColor: buttonTextColor,
    text: buttonText,
  } = button;
  ctx.fillStyle = buttonColor;
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.fillStyle = buttonTextColor;
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

export function isInsideButton(x: number, y: number, button: Button) {
  const { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight } = button;
  return x > buttonX && x < buttonX + buttonWidth && y > buttonY && y < buttonY + buttonHeight;
}
