import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID = 20;
const CELL = 18;
const TICK = 130;

const randomPos = () => ({
  x: Math.floor(Math.random() * GRID),
  y: Math.floor(Math.random() * GRID)
});

export default function SnakeGame({ onGameOver }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [level, setLevel] = useState(1);
  const dirRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const intervalRef = useRef(null);

  const spawnFood = useCallback((currentSnake) => {
    let pos;
    do { pos = randomPos(); }
    while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const tick = useCallback(() => {
    const s = snakeRef.current;
    const d = dirRef.current;
    const head = { x: s[0].x + d.x, y: s[0].y + d.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.some(seg => seg.x === head.x && seg.y === head.y)) {
      clearInterval(intervalRef.current);
      setDead(true);
      setRunning(false);
      onGameOver && onGameOver(scoreRef.current, Math.ceil(scoreRef.current / 50));
      return;
    }

    let newSnake = [head, ...s];
    let newFood = foodRef.current;
    let ate = head.x === newFood.x && head.y === newFood.y;

    if (ate) {
      const newScore = scoreRef.current + 10 + (Math.ceil(scoreRef.current / 50) * 2);
      scoreRef.current = newScore;
      setScore(newScore);
      setLevel(Math.ceil(newScore / 50));
      newFood = spawnFood(newSnake);
      foodRef.current = newFood;
      setFood(newFood);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    setSnake([...newSnake]);
  }, [spawnFood, onGameOver]);

  const startGame = () => {
    const initial = [{ x: 10, y: 10 }];
    snakeRef.current = initial;
    dirRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    const f = spawnFood(initial);
    foodRef.current = f;
    setSnake(initial);
    setDir({ x: 1, y: 0 });
    setFood(f);
    setScore(0);
    setLevel(1);
    setDead(false);
    setRunning(true);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, TICK);
  };

  useEffect(() => {
    if (running) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, TICK);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
      };
      const newDir = map[e.key];
      if (newDir) {
        e.preventDefault();
        const cur = dirRef.current;
        if (newDir.x !== -cur.x || newDir.y !== -cur.y) {
          dirRef.current = newDir;
          setDir(newDir);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const size = GRID * CELL;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score bar */}
      <div className="flex gap-6 text-sm font-bold">
        <span style={{ color: '#FFD700', textShadow: '0 0 8px #FFD700' }}>SCORE: {score}</span>
        <span style={{ color: '#00FFFF', textShadow: '0 0 8px #00FFFF' }}>LEVEL: {level}</span>
      </div>

      {/* Game board */}
      <div
        style={{
          width: size, height: size,
          backgroundColor: '#050015',
          border: '3px solid #FF1493',
          boxShadow: '0 0 20px #FF1493, inset 0 0 20px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Grid lines */}
        {Array.from({ length: GRID }).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: i * CELL, top: 0, width: 1, height: '100%', backgroundColor: 'rgba(0,255,255,0.06)' }} />
            <div style={{ position: 'absolute', top: i * CELL, left: 0, height: 1, width: '100%', backgroundColor: 'rgba(0,255,255,0.06)' }} />
          </React.Fragment>
        ))}

        {/* Food */}
        <div style={{
          position: 'absolute',
          left: food.x * CELL + 2, top: food.y * CELL + 2,
          width: CELL - 4, height: CELL - 4,
          backgroundColor: '#FFD700',
          borderRadius: '50%',
          boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700'
        }} />

        {/* Snake */}
        {snake.map((seg, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: seg.x * CELL + 1, top: seg.y * CELL + 1,
            width: CELL - 2, height: CELL - 2,
            backgroundColor: i === 0 ? '#00FFFF' : '#00FF41',
            borderRadius: i === 0 ? '4px' : '2px',
            boxShadow: i === 0 ? '0 0 8px #00FFFF' : '0 0 4px #00FF41',
            opacity: 1 - (i * 0.015)
          }} />
        ))}

        {/* Overlay */}
        {!running && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,20,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
          }}>
            {dead ? (
              <>
                <div style={{ color: '#FF1493', fontSize: 22, fontWeight: 900, textShadow: '0 0 15px #FF1493', letterSpacing: 3 }}>GAME OVER</div>
                <div style={{ color: '#FFD700', fontSize: 14, textShadow: '0 0 8px #FFD700' }}>SCORE: {score}</div>
              </>
            ) : (
              <div style={{ color: '#00FFFF', fontSize: 18, fontWeight: 900, textShadow: '0 0 15px #00FFFF', letterSpacing: 2 }}>NEON SNAKE</div>
            )}
            <button onClick={startGame} style={{
              padding: '8px 24px', backgroundColor: 'transparent',
              border: '2px solid #FF1493', color: '#FF1493',
              fontWeight: 900, letterSpacing: 2, cursor: 'pointer',
              boxShadow: '0 0 10px #FF1493', fontSize: 13,
              textShadow: '0 0 8px #FF1493'
            }}>
              {dead ? 'PLAY AGAIN' : 'START'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <button onClick={() => { if (!running) return; const d = { x: 0, y: -1 }; if (d.x !== -dirRef.current.x || d.y !== -dirRef.current.y) { dirRef.current = d; setDir(d); } }}
          style={{ padding: '6px 14px', backgroundColor: 'rgba(255,20,147,0.2)', border: '1px solid #FF1493', color: '#FF1493', cursor: 'pointer' }}>▲</button>
        <div className="flex gap-1">
          {[{ label: '◄', d: { x: -1, y: 0 } }, { label: '▼', d: { x: 0, y: 1 } }, { label: '►', d: { x: 1, y: 0 } }].map(({ label, d }) => (
            <button key={label} onClick={() => { if (!running) return; if (d.x !== -dirRef.current.x || d.y !== -dirRef.current.y) { dirRef.current = d; setDir(d); } }}
              style={{ padding: '6px 14px', backgroundColor: 'rgba(255,20,147,0.2)', border: '1px solid #FF1493', color: '#FF1493', cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>
      <p style={{ color: 'rgba(0,255,255,0.5)', fontSize: 11 }}>Use arrow keys or WASD to play</p>
    </div>
  );
}