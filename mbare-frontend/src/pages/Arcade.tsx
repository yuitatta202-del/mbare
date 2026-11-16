import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Tipi di gioco
type GameType = 'MENU' | 'REACTION' | 'CLICKER' | 'MEMORY';

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

        {/* MENU PRINCIPALE */}
        {activeGame === 'MENU' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            <button onClick={() => setActiveGame('REACTION')} className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group">
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">⚡</span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">Reaction Test</h2>
              <p className="text-mbare-muted font-sans text-sm text-center">Clicca appena diventa verde. Quanto sei veloce?</p>
            </button>

            <button onClick={() => setActiveGame('CLICKER')} className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group">
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">🖱️</span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">Spam Clicker</h2>
              <p className="text-mbare-muted font-sans text-sm text-center">10 secondi per cliccare il più possibile. Pronto?</p>
            </button>

            <button onClick={() => setActiveGame('MEMORY')} className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center justify-center hover:border-mbare-accent hover:shadow-[8px_8px_0_0_#ff3b00] transition-all group">
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">🧠</span>
              <h2 className="text-2xl font-display font-bold uppercase mb-2">Memory Spicy</h2>
              <p className="text-mbare-muted font-sans text-sm text-center">Ricorda la sequenza. Allena la tua mente.</p>
            </button>
          </div>
        )}

        {/* AREA DI GIOCO */}
        <div className="mt-8">
          {activeGame === 'REACTION' && <ReactionGame onBack={() => setActiveGame('MENU')} />}
          {activeGame === 'CLICKER' && <ClickerGame onBack={() => setActiveGame('MENU')} />}
          {activeGame === 'MEMORY' && <MemoryGame onBack={() => setActiveGame('MENU')} />}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// GIOCO 1: REACTION TEST
// ==========================================
function ReactionGame({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'IDLE' | 'WAITING' | 'READY' | 'RESULT' | 'TOO_EARLY'>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    // Pulisce il timer precedente se esiste
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setGameState('WAITING');
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 3500) + 1500;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('READY');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'WAITING') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('TOO_EARLY');
    } else if (gameState === 'READY') {
      setReactionTime(Date.now() - startTime);
      setGameState('RESULT');
    }
  };

  // Cleanup al momento della chiusura del componente
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const getBg = () => {
    if (gameState === 'READY') return 'bg-green-500';
    if (gameState === 'WAITING') return 'bg-red-500';
    if (gameState === 'TOO_EARLY') return 'bg-yellow-500';
    return 'bg-mbare-surface';
  };

  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors">← Torna al Menu</button>
      <div 
        onClick={handleClick}
        className={`w-full h-[400px] border-4 flex flex-col items-center justify-center cursor-pointer select-none transition-all ${gameState === 'IDLE' ? 'border-mbare-border' : 'border-black'} ${getBg()}`}
      >
        {gameState === 'IDLE' && (
          <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">
            Inizia a Giocare
          </button>
        )}
        {gameState === 'WAITING' && <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-black animate-pulse">Aspetta il verde...</h2>}
        {gameState === 'READY' && <h2 className="text-5xl md:text-7xl font-display font-bold uppercase text-black">CLICCA ORA!</h2>}
        {gameState === 'TOO_EARLY' && (
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase text-black mb-4">Minchia, troppo presto!</h2>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all">Riprova</button>
          </div>
        )}
        {gameState === 'RESULT' && (
          <div className="text-center">
            <h2 className="text-7xl md:text-9xl font-display font-bold text-black mb-2">{reactionTime} ms</h2>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all mt-4">Gioca Ancora</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// GIOCO 2: SPAM CLICKER
// ==========================================
function ClickerGame({ onBack }: { onBack: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  // Usiamo un ref per il timer per non farlo resettare ad ogni click
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(10);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            // Salviamo il record
            setClicks((currentClicks) => {
              setHighScore((hs) => Math.max(hs, currentClicks));
              return currentClicks;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]); // Dipende SOLO da isPlaying, non da clicks o timeLeft

  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors">← Torna al Menu</button>
      
      <div className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center">
        <div className="flex justify-between w-full mb-8 font-mono text-xl">
          <div>Tempo: <span className="text-mbare-accent font-bold">{timeLeft}s</span></div>
          <div>Clicks: <span className="text-mbare-accent font-bold">{clicks}</span></div>
          <div>Record: <span className="text-mbare-white">{highScore}</span></div>
        </div>

        {!isPlaying && timeLeft === 10 && (
          <button onClick={startGame} className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">
            Inizia a Cliccare
          </button>
        )}

        {isPlaying && (
          <button 
            onClick={() => setClicks(c => c + 1)}
            className="w-full h-[200px] bg-mbare-accent text-black text-4xl font-display font-bold uppercase tracking-tighter rounded hover:scale-[0.98] active:scale-95 transition-all"
          >
            CLICCA QUA! ({clicks})
          </button>
        )}

        {!isPlaying && timeLeft <= 0 && (
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold uppercase mb-2">Tempo Scaduto!</h2>
            <p className="text-2xl text-mbare-accent font-mono mb-6">{clicks} clicks in 10 secondi</p>
            <button onClick={startGame} className="bg-mbare-white text-black px-8 py-4 font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">
              Riprova
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// GIOCO 3: MEMORY SPICY
// ==========================================
const ICONS = ['🌶️', '💀', '🎓', '🍕', '👽', '💸'];

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  // Stato per bloccare i click mentre le icone lampeggiano
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const startGame = () => {
    clearTimers();
    setSequence([]);
    setUserSequence([]);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    nextLevel([]);
  };

  const nextLevel = (currentSeq: string[]) => {
    const newIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const newSeq = [...currentSeq, newIcon];
    setSequence(newSeq);
    setUserSequence([]);
    playSequence(newSeq);
  };

  const playSequence = (seq: string[]) => {
    setIsShowingSequence(true);
    let i = 0;
    
    intervalRef.current = setInterval(() => {
      const currentIcon = seq[i];
      setActiveIcon(currentIcon);
      
      timeoutRef.current = setTimeout(() => setActiveIcon(null), 500);
      
      i++;
      if (i >= seq.length) {
        clearInterval(intervalRef.current!);
        // Aspetta un attimo dopo l'ultima icona prima di sbloccare i click
        timeoutRef.current = setTimeout(() => setIsShowingSequence(false), 800);
      }
    }, 800);
  };

  const handleIconClick = (icon: string) => {
    // Blocca se il gioco non è attivo o se la sequenza sta ancora lampeggiando
    if (!isPlaying || isShowingSequence || activeIcon) return;

    const newUserSeq = [...userSequence, icon];
    setUserSequence(newUserSeq);

    // Controlla se ha sbagliato
    if (icon !== sequence[newUserSeq.length - 1]) {
      clearTimers();
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Se ha completato la sequenza
    if (newUserSeq.length === sequence.length) {
      setIsShowingSequence(true); // blocca click temporaneamente
      setTimeout(() => {
        setLevel(l => l + 1);
        nextLevel(sequence);
      }, 1000);
    }
  };

  // Cleanup per evitare memory leak
  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div className="animate-slide-up">
      <button onClick={onBack} className="text-mbare-muted font-mono text-xs uppercase mb-4 hover:text-white transition-colors">← Torna al Menu</button>
      
      <div className="bg-mbare-surface border-2 border-mbare-border p-8 flex flex-col items-center">
        <div className="w-full flex justify-between font-mono text-xl mb-8">
          <div>Livello: <span className="text-mbare-accent font-bold">{level}</span></div>
        </div>

        {!isPlaying && !gameOver && (
          <button onClick={startGame} className="bg-mbare-white text-black px-10 py-5 text-2xl font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">
            Inizia a Ricordare
          </button>
        )}

        {isPlaying && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => handleIconClick(icon)}
                className={`w-24 h-24 text-5xl flex items-center justify-center border-2 transition-all ${
                  activeIcon === icon ? 'bg-mbare-accent scale-110 border-white' : 'bg-mbare-black border-mbare-border hover:border-mbare-white'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {gameOver && (
          <div className="text-center">
            <h2 className="text-4xl font-display font-bold uppercase text-red-500 mb-2">Hai Sbagliato!</h2>
            <p className="text-xl text-mbare-muted font-mono mb-6">Sei arrivato al livello {level}</p>
            <button onClick={startGame} className="bg-mbare-white text-black px-8 py-4 font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">
              Riprova
            </button>
          </div>
        )}
      </div>
    </div>
  );
}