import { FC, useEffect, useRef, useState } from "react";
import TransactionTable from "../TransactionTable/TransactionTable";
import LevelSelection from "./LevelSelection";
import { Brick } from "./game_utils/createBricks";
import { createParticles } from "./game_utils/createParticles";
import { Ball, drawBall } from "./game_utils/drawBall";
import { drawBricks } from "./game_utils/drawBricks";
import { Paddle, drawPaddle } from "./game_utils/drawPaddle";
import { Particle, drawParticles } from "./game_utils/drawParticles";
import { drawText } from "./game_utils/drawText";
import { GetServerSideProps } from "next";
import { useAccount } from "wagmi";
import { displayTxResult } from "~~/app/debug/_components/contract";
import { getTransactions } from "~~/services/transactionQueue/queue";
import { useRequestLogic } from "~~/services/web3/useRequests";

interface BreakoutGameProps {
  transactions: any[];
}

const BreakoutGame: FC<BreakoutGameProps> = ({ transactions }) => {
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
  const particlesRef = useRef<Particle[]>([]);
  const transactionQueue = useRef<Promise<void>>(Promise.resolve());

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

    canvas.width = 800;
    canvas.height = 500;

    // Ball properties
    const ball: Ball = {
      x: canvas.width / 2,
      y: canvas.height - 30,
      dx: 4,
      dy: -4,
      radius: 8,
    };

    // Paddle properties
    const paddle: Paddle = {
      width: 100,
      height: 10,
      x: (canvas.width - 100) / 2,
      dx: 8,
    };

    const brickRowCount = 8;
    const brickColumnCount = 10;
    const brickWidth = 75;
    const brickHeight = 20;
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
      text: "Press space to start the game",
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: 2,
      dy: 2,
      fontSize: 20,
      color: "#FFFFFF",
    };

    const bricks: Brick[][] = [];
    let brickIdCounter = BigInt(1);
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { id: brickIdCounter, x: 0, y: 0, status: 1 };
        brickIdCounter++;
      }
    }

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
        } else {
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
            if (
              ball.x > brick.x &&
              ball.x < brick.x + brickWidth &&
              ball.y > brick.y &&
              ball.y < brick.y + brickHeight
            ) {
              ball.dy = -ball.dy;
              brick.status = 0;
              setScore(prevScore => prevScore + 1);
              if (brickHitSound) brickHitSound.play();
              createParticles(brick.x + brickWidth / 2, brick.y + brickHeight / 2, particlesRef);
              handleRegisterBrickBroken(address);
            }
          }
        }
      }
      if (allBricksBroken) {
        setLevelComplete(true);
        setGameStarted(false);
      }
    }

    function drawBouncingText(ctx: CanvasRenderingContext2D, textProps: any) {
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
        drawBall(ctx, ball);
        drawPaddle(ctx, canvas, paddle);
        drawParticles(ctx, particlesRef);
        collisionDetection();

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (canvas && (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0)) {
          ball.dx = -ball.dx;
        }

        if (ball.y - ball.radius < 0) {
          ball.dy = -ball.dy;
        } else if (canvas && ball.y + ball.radius > canvas.height) {
          setGameOver(true);
          setUserLost(true);
          if (gameOverSound) gameOverSound.play();
          return;
        }

        if (
          canvas &&
          ball.y + ball.radius > canvas.height - paddle.height &&
          ball.x > paddle.x &&
          ball.x < paddle.x + paddle.width
        ) {
          ball.dy = -ball.dy;
        }

        if (canvas && rightPressed && paddle.x < canvas.width - paddle.width) {
          paddle.x += paddle.dx;
        } else if (leftPressed && paddle.x > 0) {
          paddle.x -= paddle.dx;
        }

        if (!gameOver && !levelComplete) {
          if (score > 0 && score % 5 === 0) {
            ball.dx *= 1.1;
            ball.dy *= 1.1;
          }
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
  }, [gameOver, restart, gameReady, brickHitSound, gameOverSound, address, gameStarted, levelSelected]);

  const handleSelectLevel = (level: number) => {
    setLevelSelected(true);
    // Set the player level or any other level-specific logic here
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      {!levelSelected ? (
        <LevelSelection onSelectLevel={handleSelectLevel} />
      ) : (
        <>
          <canvas ref={canvasRef} className="border border-white" />
          <div className="text-white text-xl mt-4">Score: {score}</div>
          <div className="text-white text-xl mt-4">Level: {displayTxResult(playerLevel)}</div>
        </>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const transactions = getTransactions();
  console.log("SSR transactions", transactions);
  return {
    props: {
      transactions,
    },
  };
};

export default BreakoutGame;
