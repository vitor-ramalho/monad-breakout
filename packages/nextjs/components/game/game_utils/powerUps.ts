export interface PowerUp {
  type: 'MULTI_BALL' | 'WIDE_PADDLE';
  x: number;
  y: number;
  dy: number;
  width: number;
  height: number;
  active: boolean;
  duration: number;
  startTime?: number;
}

export function createPowerUp(x: number, y: number, type: PowerUp['type']): PowerUp {
  return {
    type,
    x,
    y,
    dy: 2,
    width: 20,
    height: 20,
    active: true,
    duration: 10000, // 10 seconds
  };
}

export function drawPowerUp(ctx: CanvasRenderingContext2D | null, powerUp: PowerUp) {
  if (!ctx || !powerUp.active) return;

  ctx.save();
  ctx.beginPath();

  // Draw power-up background
  ctx.fillStyle = powerUp.type === 'MULTI_BALL' ? '#FF4444' : '#44FF44';
  ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

  // Draw power-up icon
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const icon = powerUp.type === 'MULTI_BALL' ? '×2' : '↔';
  ctx.fillText(icon, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);

  ctx.restore();
}

export function updatePowerUp(powerUp: PowerUp) {
  if (!powerUp.active) return;
  powerUp.y += powerUp.dy;
}

export function checkPowerUpCollision(powerUp: PowerUp, paddle: { x: number; y: number; width: number; height: number }) {
  if (!powerUp.active) return false;

  return (
    powerUp.x < paddle.x + paddle.width &&
    powerUp.x + powerUp.width > paddle.x &&
    powerUp.y < paddle.y + paddle.height &&
    powerUp.y + powerUp.height > paddle.y
  );
}

export function activatePowerUp(powerUp: PowerUp, paddle: { width: number }, balls: Array<any>) {
  powerUp.active = false;
  powerUp.startTime = Date.now();

  switch (powerUp.type) {
    case 'MULTI_BALL':
      // Create a new ball with the same properties as the first ball
      const originalBall = balls[0];
      const newBall = { ...originalBall };
      // Slightly modify the direction to make it interesting
      newBall.dx = -originalBall.dx;
      balls.push(newBall);
      break;
    case 'WIDE_PADDLE':
      paddle.width *= 1.5; // Increase paddle width by 50%
      break;
  }
}

export function deactivatePowerUp(powerUp: PowerUp, paddle: { width: number }, balls: Array<any>) {
  switch (powerUp.type) {
    case 'MULTI_BALL':
      // Remove all balls except the first one
      balls.splice(1);
      break;
    case 'WIDE_PADDLE':
      paddle.width /= 1.5; // Restore original paddle width
      break;
  }
} 