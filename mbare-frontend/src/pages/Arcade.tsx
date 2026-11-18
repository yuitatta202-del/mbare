
import { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// MBARE ARCADE
// React + Vite + TypeScript
// ==========================================

type GameType = 'MENU' | 'REACTION' | 'CLICKER' | 'MEMORY';

type GameProps = {
  onBack: () => void;
};

type ReactionState =
  | 'IDLE'
  | 'WAITING'
  | 'READY'
  | 'RESULT'
  | 'TOO_EARLY';

// Timer compatibili con il browser.
type Timer = ReturnType<typeof setTimeout>;

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

export function Arcade() {
  const [activeGame, setActiveGame] = useState<GameType>('MENU');

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center bg-mbare-black text-white">
      <div className="w-full max-w-4xl text-center">

        <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none mb-4">
          Mbare<span className="text-mbare-accent">.</span> Arcade
        </h1>

        <p className="text-xl font-sans text-mbare-muted mb-12">
          Sfida i tuoi amici. Dimostra chi è il vero Capo.
        </p>

        {activeGame === 'MENU' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">

            <button
              type="button"
              onClick={() => setActiveGame('REACTION')}
              className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group"
            >
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                ⚡
              </span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">
                Reaction Test
              </h2>
              <p className="text-mbare-muted font-sans text-sm text-center">
                Clicca appena diventa verde. Quanto sei veloce?
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveGame('CLICKER')}
              className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group"
            >
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🖱️
              </span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">
                Spam Clicker
              </h2>
              <p className="text-mbare-muted font-sans text-sm text-center">
                10 secondi per cliccare il più possibile. Pronto?
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveGame('MEMORY')}
              className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group"
            >
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🧠
              </span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">
                Memory Spicy
              </h2>
              <p className="text-mbare-muted font-sans text-sm text-center">
                Ricorda la sequenza. Allena la tua mente.
              </p>
            </button>
          </div>
        )}

        <div className="mt-8">
          {activeGame === 'REACTION' && (
            <ReactionGame onBack={() => setActiveGame('MENU')} />
          )}

          {activeGame === 'CLICKER' && (
            <ClickerGame onBack={() => setActiveGame('MENU')} />
          )}

          {activeGame === 'MEMORY' && (
            <MemoryGame onBack={() => setActiveGame('MENU')} />
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// GIOCO 1 - REACTION TEST
// ==========================================

function ReactionGame({ onBack }: GameProps) {
  const [gameState, setGameState] =
    useState<ReactionState>('IDLE');

  const [reactionTime, setReactionTime] =
    useState<number | null>(null);

  const timeoutRef = useRef<Timer | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startGame = () => {
    clearTimer();

    setGameState('WAITING');
    setReactionTime(null);

    const delay = Math.floor(Math.random() * 3500) + 1500;

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      startTimeRef.current = performance.now();
      setGameState('READY');
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'WAITING') {
      clearTimer();
      setGameState('TOO_EARLY');
      return;
    }

    if (gameState === 'READY') {
      const elapsed =
        performance.now() - startTimeRef.current;

      setReactionTime(Math.round(elapsed));
      setGameState('RESULT');
    }
  };

  const getBackground = () => {
    switch (gameState) {
      case 'READY':
        return 'bg-green-500';
      case 'WAITING':
        return 'bg-red-500';
      case 'TOO_EARLY':
        return 'bg-yellow-500';
      default:
        return 'bg-mbare-surface';
    }
  };

  return (
    <div className="animate-slide-up">

      <button
        type="button"
        onClick={onBack}
        className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors"
      >
        ← Torna al Menu
      </button>

      <div
        role="button"
        tabIndex={gameState === 'WAITING' || gameState === 'READY' ? 0 : -1}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`w-full h-[400px] border-4 flex flex-col items-center justify-center select-none transition-all ${
          gameState === 'IDLE'
            ? 'border-mbare-border'
            : 'border-black'
        } ${
          gameState === 'WAITING' || gameState === 'READY'
            ? 'cursor-pointer'
            : ''
        } ${getBackground()}`}
      >

        {gameState === 'IDLE' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startGame();
            }}
            className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
          >
            Inizia a Giocare
          </button>
        )}

        {gameState === 'WAITING' && (
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-black animate-pulse">
            Aspetta il verde...
          </h2>
        )}

        {gameState === 'READY' && (
          <h2 className="text-5xl md:text-7xl font-display font-bold uppercase text-black">
            CLICCA ORA!
          </h2>
        )}

        {gameState === 'TOO_EARLY' && (
          <div className="text-center px-4">
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-black mb-4">
              Minchia, troppo presto!
            </h2>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all"
            >
              Riprova
            </button>
          </div>
        )}

        {gameState === 'RESULT' && (
          <div className="text-center">
            <p className="font-mono uppercase text-black mb-3">
              Tempo di reazione
            </p>

            <h2 className="text-7xl md:text-9xl font-display font-bold text-black mb-2">
              {reactionTime} ms
            </h2>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all mt-4"
            >
              Gioca Ancora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// GIOCO 2 - SPAM CLICKER
// ==========================================

function ClickerGame({ onBack }: GameProps) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const timerRef = useRef<Timer | null>(null);
  const clicksRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startGame = () => {
    clearTimer();

    clicksRef.current = 0;

    setClicks(0);
    setTimeLeft(10);
    setIsPlaying(true);

    const endTime = performance.now() + 10000;

    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((endTime - performance.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearTimer();
        setIsPlaying(false);
        setHighScore(previous =>
          Math.max(previous, clicksRef.current)
        );
      }
    }, 100);
  };

  const handleClick = () => {
    if (!isPlaying) return;

    clicksRef.current += 1;
    setClicks(clicksRef.current);
  };

  return (
    <div className="animate-slide-up">

      <button
        type="button"
        onClick={onBack}
        className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors"
      >
        ← Torna al Menu
      </button>

      <div className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center">

        <div className="flex flex-wrap justify-between gap-4 w-full mb-8 font-mono text-xl">
          <div>
            Tempo:{' '}
            <span className="text-mbare-accent font-bold">
              {timeLeft}s
            </span>
          </div>

          <div>
            Clicks:{' '}
            <span className="text-mbare-accent font-bold">
              {clicks}
            </span>
          </div>

          <div>
            Record:{' '}
            <span className="text-mbare-white">
              {highScore}
            </span>
          </div>
        </div>

        {!isPlaying && timeLeft === 10 && (
          <button
            type="button"
            onClick={startGame}
            className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
          >
            Inizia a Cliccare
          </button>
        )}

        {isPlaying && (
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-[200px] bg-mbare-accent text-black text-4xl font-display font-bold uppercase tracking-tighter rounded hover:scale-[0.98] active:scale-95 transition-all select-none touch-manipulation"
          >
            CLICCA QUA! ({clicks})
          </button>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold uppercase mb-2">
              Tempo Scaduto!
            </h2>

            <p className="text-2xl text-mbare-accent font-mono mb-6">
              {clicks} clicks in 10 secondi
            </p>

            <button
              type="button"
              onClick={startGame}
              className="bg-mbare-white text-black px-8 py-4 font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
            >
              Riprova
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// GIOCO 3 - MEMORY SPICY
// ==========================================

const ICONS = ['🌶️', '💀', '🎓', '🍕', '👽', '💸'];

function MemoryGame({ onBack }: GameProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  const timersRef = useRef<Timer[]>([]);
  const sequenceLockedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => {
      window.clearTimeout(id);
    });

    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const schedule = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push(id);
  };

  const playSequence = (seq: string[]) => {
    clearTimers();

    sequenceLockedRef.current = true;
    setIsShowingSequence(true);
    setActiveIcon(null);

    seq.forEach((icon, index) => {
      const start = 500 + index * 800;

      schedule(() => {
        setActiveIcon(icon);
      }, start);

      schedule(() => {
        setActiveIcon(null);
      }, start + 500);
    });

    schedule(() => {
      sequenceLockedRef.current = false;
      setIsShowingSequence(false);
    }, 500 + seq.length * 800);
  };

  const nextLevel = (currentSequence: string[]) => {
    const newIcon =
      ICONS[Math.floor(Math.random() * ICONS.length)];

    const nextSequence = [...currentSequence, newIcon];

    setSequence(nextSequence);
    setUserSequence([]);
    playSequence(nextSequence);
  };

  const startGame = () => {
    clearTimers();

    sequenceLockedRef.current = true;

    setSequence([]);
    setUserSequence([]);
    setActiveIcon(null);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);

    nextLevel([]);
  };

  const handleIconClick = (icon: string) => {
    if (
      !isPlaying ||
      isShowingSequence ||
      sequenceLockedRef.current ||
      activeIcon !== null
    ) {
      return;
    }

    const nextUserSequence = [...userSequence, icon];
    setUserSequence(nextUserSequence);

    const index = nextUserSequence.length - 1;

    if (icon !== sequence[index]) {
      clearTimers();

      sequenceLockedRef.current = true;

      setGameOver(true);
      setIsPlaying(false);
      setIsShowingSequence(false);
      setActiveIcon(null);
      return;
    }

    if (nextUserSequence.length === sequence.length) {
      sequenceLockedRef.current = true;
      setIsShowingSequence(true);

      schedule(() => {
        setLevel(previous => previous + 1);
        nextLevel(sequence);
      }, 1000);
    }
  };

  return (
    <div className="animate-slide-up">

      <button
        type="button"
        onClick={onBack}
        className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors"
      >
        ← Torna al Menu
      </button>

      <div className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center">

        <div className="w-full flex justify-between font-mono text-xl mb-8">
          <div>
            Livello:{' '}
            <span className="text-mbare-accent font-bold">
              {level}
            </span>
          </div>
        </div>

        {!isPlaying && !gameOver && (
          <button
            type="button"
            onClick={startGame}
            className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
          >
            Inizia a Ricordare
          </button>
        )}

        {isPlaying && (
          <>
            <p className="font-mono text-xs uppercase text-mbare-muted mb-6">
              {isShowingSequence
                ? 'Memorizza la sequenza...'
                : 'Ripeti la sequenza!'}
            </p>

            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
              {ICONS.map(icon => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => handleIconClick(icon)}
                  disabled={isShowingSequence}
                  aria-label={`Seleziona ${icon}`}
                  className={`w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl flex items-center justify-center border-2 transition-all ${
                    activeIcon === icon
                      ? 'bg-mbare-accent scale-110 border-white'
                      : 'bg-mbare-black border-mbare-border hover:border-mbare-white'
                  } disabled:cursor-not-allowed`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <p className="text-xs font-mono text-mbare-muted">
              Progressi: {userSequence.length}/{sequence.length}
            </p>
          </>
        )}

        {gameOver && (
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold uppercase text-red-500 mb-2">
              Hai Sbagliato!
            </h2>

            <p className="text-xl text-mbare-muted font-mono mb-6">
              Sei arrivato al livello {level}
            </p>

            <button
              type="button"
              onClick={startGame}
              className="bg-mbare-white text-black px-8 py-4 font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
            >
              Riprova
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Arcade;
