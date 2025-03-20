import { FC, useEffect, useRef, useState } from "react";
import LevelSelection from "./LevelSelection";
import { createBricks } from "./game_utils/createBricks";
import { createParticles } from "./game_utils/createParticles";
import { Ball, drawBall } from "./game_utils/drawBall";
import { drawBricks } from "./game_utils/drawBricks";
import { Paddle, drawPaddle } from "./game_utils/drawPaddle";
import { Particle, drawParticles } from "./game_utils/drawParticles";
import { drawText } from "./game_utils/drawText";
import { PowerUp, createPowerUp, drawPowerUp, updatePowerUp, checkPowerUpCollision, activatePowerUp, deactivatePowerUp } from "./game_utils/powerUps";
import { GetServerSideProps } from "next";
import { useAccount } from "wagmi";
import { getTransactions } from "~~/services/transactionQueue/queue";
import { useRequestLogic } from "~~/services/web3/useRequests";

interface BreakoutGameProps {
  transactions: any[];
}

const BreakoutGame: FC<BreakoutGameProps> = () => {
  const { address } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [restart, setRestart] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameReady, setGameReady] = useState(true);
  const [brickHitSound, setBrickHitSound] = useState<HTMLAudioElement | null>(null);
  const [gameOverSound, setGameOverSound] = useState<HTMLAudioElement | null>(null);
  const [playerLevel, setPlayerLevel] = useState<bigint>();
  const [levelComplete, setLevelComplete] = useState(false);
  const [userLost, setUserLost] = useState(false);
  const [levelSelected, setLevelSelected] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const particlesRef = useRef<Particle[]>([]);
  const transactionQueue = useRef<Promise<void>>(Promise.resolve());
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);
  const fallingPowerUpsRef = useRef<PowerUp[]>([]);
  const ballsRef = useRef<Ball[]>([]);

  const { authorizeRelayer, handleRegisterBrickBroken, handleStartGame } = useRequestLogic();

  useEffect(() => {
    setBrickHitSound(new Audio("/sounds/brick-hit.wav"));
    setGameOverSound(new Audio("/sounds/game-over.wav"));
    // authorizeRelayer(address);
  }, [address]);

  useEffect(() => {
    if (!gameReady || !levelSelected) return;

    const canvas = canvasRef.current;

    if (!canvas) return; // Ensure canvas is available

    const ctx = canvas.getContext("2d");

    if (!ctx) return; // Ensure context is available

    canvas.width = 1000;
    canvas.height = 600;

    // Ball properties
    const initialBall: Ball = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      dx: 4,
      dy: -4,
      radius: 8,
    };
    
    ballsRef.current = [initialBall];

    // Paddle properties
    const paddle: Paddle = {
      width: Math.max(100 - (currentLevel - 1) * 5, 50),
      height: 10,
      x: (canvas.width - (100 - (currentLevel - 1) * 5)) / 2,
      y: canvas.height - 20,
      dx: 8 + (currentLevel - 1) * 0.5,
    };

    const brickRowCount = 8;
    const brickColumnCount = 10;
    const brickWidth = 90;
    const brickHeight = 25;
    const brickPadding = 10;
    const brickOffsetTop = 50;
    const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) / 2;

    const brickProperties = {
      brickRowCount,
      brickColumnCount,
      brickWidth,
      brickHeight,
      brickPadding,
      brickOffsetTop,
      brickOffsetLeft,
    };

    const textProperties = {
      text: `Level ${currentLevel} - Press space to start`,
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: 2,
      dy: 2,
      fontSize: 20,
      color: "#FFFFFF",
    };

    const bricks = createBricks(brickColumnCount, brickRowCount, currentLevel);

    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (userLost) {
          resetGame();
        } else if (!gameStarted) {
          setGameStarted(true);
          setUserLost(false);
          update();
        }
      }
    }

    function keyUpHandler(e: KeyboardEvent) {
      if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
      }
    }

    function collisionDetection() {
      let allBricksBroken = true;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r];
          if (brick.status === 1) {
            allBricksBroken = false;
            
            // Check collision for each ball
            for (const ball of ballsRef.current) {
              if (
                ball.x > brick.x &&
                ball.x < brick.x + brickWidth &&
                ball.y > brick.y &&
                ball.y < brick.y + brickHeight
              ) {
                ball.dy = -ball.dy;
                brick.currentHits++;
                handleRegisterBrickBroken(address);

                if (brick.currentHits >= brick.hitsRequired) {
                  brick.status = 0;
                  setScore(prevScore => prevScore + brick.hitsRequired);
                  if (brickHitSound) brickHitSound.play();
                  createParticles(brick.x + brickWidth / 2, brick.y + brickHeight / 2, particlesRef);

                  // Create power-up if brick had one
                  if (brick.hasPowerUp && brick.powerUpType) {
                    const powerUp = createPowerUp(
                      brick.x + brickWidth / 2 - 10,
                      brick.y + brickHeight,
                      brick.powerUpType
                    );
                    fallingPowerUpsRef.current.push(powerUp);
                  }
                }
                break;
              }
            }
          }
        }
      }
      if (allBricksBroken) {
        setLevelComplete(true);
        setGameStarted(false);
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
          setLevelComplete(false);
          setGameStarted(false);
        }, 2000);
      }
    }

    function drawBouncingText(ctx: CanvasRenderingContext2D, textProps: any) {
      if (!canvas) return;
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

    function update() {
      if (gameStarted === false) {
        if (ctx && canvas) {
          drawBouncingText(ctx, textProperties);
        }
      } else if (userLost) {
        if (ctx && canvas) {
          drawText(ctx, { ...textProperties, text: "You lose, press spacebar to try again" }, canvas);
        }
      } else {
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        drawBricks(ctx, bricks, brickProperties);
        drawParticles(ctx, particlesRef);

        // Update and draw all balls
        for (const ball of ballsRef.current) {
          drawBall(ctx, ball);
          ball.x += ball.dx;
          ball.y += ball.dy;

          if (canvas && (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0)) {
            ball.dx = -ball.dx;
          }

          if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
          }

          if (canvas && ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
          }
        }

        // Remove balls that fall below the canvas
        ballsRef.current = ballsRef.current.filter(ball => {
          if (!canvas) return true;
          return ball.y + ball.radius <= canvas.height;
        });

        // Game over if no balls remain
        if (ballsRef.current.length === 0) {
          setGameOver(true);
          setUserLost(true);
          if (gameOverSound) gameOverSound.play();
          return;
        }

        drawPaddle(ctx, canvas, paddle);

        // Move paddle based on key presses
        if (canvas && rightPressed && paddle.x < canvas.width - paddle.width) {
          paddle.x += paddle.dx;
        } else if (leftPressed && paddle.x > 0) {
          paddle.x -= paddle.dx;
        }

        // Update and draw falling power-ups
        fallingPowerUpsRef.current = fallingPowerUpsRef.current.filter(powerUp => {
          if (!canvas) return false;
          updatePowerUp(powerUp);
          drawPowerUp(ctx, powerUp);

          // Check if power-up is collected by paddle
          if (checkPowerUpCollision(powerUp, paddle)) {
            activatePowerUp(powerUp, paddle, ballsRef.current);
            setActivePowerUps(active => [...active, powerUp]);
            return false;
          }

          // Remove power-ups that fall below canvas
          return powerUp.y <= canvas.height;
        });

        // Check for expired power-ups
        setActivePowerUps(prev => {
          const now = Date.now();
          const stillActive = prev.filter(powerUp => {
            if (powerUp.startTime && now - powerUp.startTime >= powerUp.duration) {
              deactivatePowerUp(powerUp, paddle, ballsRef.current);
              return false;
            }
            return true;
          });
          return stillActive;
        });

        collisionDetection();

        if (!gameOver && !levelComplete) {
          requestAnimationFrame(update);
        }
      }
    }

    function resetGame() {
      setGameStarted(false);
      setUserLost(false);
      setScore(0);
      setGameOver(false);
      update();
    }

    update();

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, [gameOver, restart, gameReady, brickHitSound, gameOverSound, address, gameStarted, levelSelected, currentLevel]);

  const handleSelectLevel = (level: number) => {
    setLevelSelected(true);
    setCurrentLevel(level);
  };

  const handleBackToLevelSelection = () => {
    setLevelSelected(false);
    setGameStarted(false);
    setUserLost(false);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      {!levelSelected ? (
        <LevelSelection onSelectLevel={handleSelectLevel} />
      ) : (
        <>
          <canvas ref={canvasRef} className="border border-white" />
          <div className="flex gap-4 mt-4">
            <div className="text-white text-xl">Score: {score}</div>
            <div className="text-white text-xl">Level: {currentLevel}</div>
          </div>
          {levelComplete && (
            <div className="text-green-500 text-2xl mt-4 animate-pulse">Level Complete! Next level starting...</div>
          )}
          {userLost && (
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="text-red-500 text-2xl">Game Over!</div>
              <button
                onClick={handleBackToLevelSelection}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Level Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BreakoutGame;
