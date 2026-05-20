import { useState, useEffect, useRef, useCallback } from "react";

const CANVAS_W = 320;
const CANVAS_H = 480;
const BIRD_SIZE = 24;
const PIPE_W = 50;
const GAP = 130;
const GRAVITY = 0.4;
const JUMP = -7;
const PIPE_SPEED = 2.5;

type Pipe = { x: number; topH: number };

const FlappyBirdGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const gameState = useRef({
    birdY: CANVAS_H / 2,
    velocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    frame: 0,
    running: false,
  });

  const jump = useCallback(() => {
    if (gameOver) return;
    if (!started) {
      setStarted(true);
      gameState.current.running = true;
    }
    gameState.current.velocity = JUMP;
  }, [gameOver, started]);

  const reset = useCallback(() => {
    const gs = gameState.current;
    gs.birdY = CANVAS_H / 2;
    gs.velocity = 0;
    gs.pipes = [];
    gs.score = 0;
    gs.frame = 0;
    gs.running = false;
    setScore(0);
    setGameOver(false);
    setStarted(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const loop = () => {
      const gs = gameState.current;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      // Ground
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
      ctx.fillStyle = "#228B22";
      ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 8);

      if (gs.running) {
        gs.velocity += GRAVITY;
        gs.birdY += gs.velocity;
        gs.frame++;

        // Spawn pipes
        if (gs.frame % 90 === 0) {
          const topH = 60 + Math.random() * (CANVAS_H - GAP - 140);
          gs.pipes.push({ x: CANVAS_W, topH });
        }

        // Move pipes
        gs.pipes = gs.pipes.filter(p => p.x + PIPE_W > -10);
        for (const p of gs.pipes) {
          p.x -= PIPE_SPEED;
          if (Math.abs(p.x + PIPE_W - 60) < 2) {
            gs.score++;
            setScore(gs.score);
          }
        }

        // Collision
        const birdTop = gs.birdY - BIRD_SIZE / 2;
        const birdBottom = gs.birdY + BIRD_SIZE / 2;
        const birdLeft = 50 - BIRD_SIZE / 2;
        const birdRight = 50 + BIRD_SIZE / 2;

        if (birdBottom > CANVAS_H - 40 || birdTop < 0) {
          gs.running = false;
          setGameOver(true);
          setBestScore(prev => Math.max(prev, gs.score));
        }

        for (const p of gs.pipes) {
          if (birdRight > p.x && birdLeft < p.x + PIPE_W) {
            if (birdTop < p.topH || birdBottom > p.topH + GAP) {
              gs.running = false;
              setGameOver(true);
              setBestScore(prev => Math.max(prev, gs.score));
            }
          }
        }
      }

      // Draw pipes
      for (const p of gs.pipes) {
        ctx.fillStyle = "#2E7D32";
        ctx.fillRect(p.x, 0, PIPE_W, p.topH);
        ctx.fillRect(p.x - 3, p.topH - 20, PIPE_W + 6, 20);
        ctx.fillRect(p.x, p.topH + GAP, PIPE_W, CANVAS_H - p.topH - GAP);
        ctx.fillRect(p.x - 3, p.topH + GAP, PIPE_W + 6, 20);
      }

      // Draw bird
      ctx.fillStyle = "#FFC107";
      ctx.beginPath();
      ctx.arc(50, gs.birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FF5722";
      ctx.beginPath();
      ctx.moveTo(50 + BIRD_SIZE / 2, gs.birdY);
      ctx.lineTo(50 + BIRD_SIZE / 2 + 8, gs.birdY + 3);
      ctx.lineTo(50 + BIRD_SIZE / 2, gs.birdY + 6);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(54, gs.birdY - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(56, gs.birdY - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Score text
      ctx.fillStyle = "white";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.strokeText(`${gs.score}`, CANVAS_W / 2, 50);
      ctx.fillText(`${gs.score}`, CANVAS_W / 2, 50);

      if (!started && !gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "white";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Tap or Click to Start!", CANVAS_W / 2, CANVAS_H / 2);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [started, gameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">🐦 Flappy Bird</h2>
          <p className="text-sm text-muted-foreground">{gameOver ? `Game Over! Best: ${bestScore}` : "Tap/Click/Space to fly"}</p>
        </div>
        <button onClick={reset} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">Reset</button>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={gameOver ? reset : jump}
          className="rounded-2xl border border-border shadow-card cursor-pointer"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default FlappyBirdGame;
