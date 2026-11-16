import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { SpicyMeter } from '../SpicyMeter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIES = [
  { id: 'SPICY', label: 'Spicy 🌶️', color: 'bg-red-500', hover: 'hover:border-red-500' },
  { id: 'CRINGE', label: 'Cringe 💀', color: 'bg-gray-500', hover: 'hover:border-gray-500' },
  { id: 'UNI', label: 'Vita Uni 🎓', color: 'bg-blue-500', hover: 'hover:border-blue-500' },
  { id: 'DRAMA', label: 'Drama 👀', color: 'bg-purple-500', hover: 'hover:border-purple-500' },
  { id: 'UNPOPULAR', label: 'Unpopular 🗣️', color: 'bg-yellow-500', hover: 'hover:border-yellow-500' },
];

export function SpifferaForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useUser();
  
  const [content, setContent] = useState('');
  const [spicyLevel, setSpicyLevel] = useState(50);
  const [category, setCategory] = useState('SPICY'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stati per il feedback visivo (Pro Tip: no più alert del browser)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hue = 60 - (spicyLevel / 100) * 60;
  const buttonColor = `hsl(${hue}, 100%, 50%)`;

  // Calcola la lunghezza del testo per l'indicatore visivo
  const charCount = content.length;
  const isAlmostFull = charCount > 900;

  // Auto-nasconde i messaggi dopo 5 secondi
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setErrorMsg("Ehi, ma unni vai? Prima ti devi accàttari per spifferare!");
      return;
    }
    if (content.trim().length < 20) {
      setErrorMsg("Minchia, scrivi almeno 20 caratteri! Non si capisce niente.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${API_URL}/confessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          category,
          spicy_level: spicyLevel,
          is_anonymous: true
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore durante l\'invio');
      }

      // Reset del form in caso di successo
      setContent('');
      setSpicyLevel(50);
      setCategory('SPICY');
      setSuccessMsg('Spifferato! In attesa di approvazione da parte dell\'admin.');
      
      onSuccess(); // Ricarica il feed della pagina padre
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Ahi ahi, quarchi cosa si ruppe. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sticky top-32">
      <h2 className="font-display font-bold text-2xl uppercase border-b-2 border-mbare-border pb-2 mb-6">
        Spiffera Adesso
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-mbare-surface p-6 border-2 border-mbare-border relative shadow-[4px_4px_0_0_#222]">
        
        {/* Feedback di Errore */}
        {errorMsg && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-3 animate-slide-up flex items-start gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-400 font-sans text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Feedback di Successo */}
        {successMsg && (
          <div className="bg-green-500/10 border-l-4 border-green-500 p-3 animate-slide-up flex items-start gap-2">
            <span className="text-green-500">✅</span>
            <p className="text-green-400 font-sans text-sm">{successMsg}</p>
          </div>
        )}

        {/* Categorie */}
        <div className="flex flex-col gap-3">
          <label className="font-mono text-xs text-mbare-muted uppercase">Che tipo di tea è?</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 font-mono text-xs uppercase border-2 transition-all duration-200 ${
                  category === cat.id 
                    ? `${cat.color} text-black border-transparent font-bold scale-105 shadow-[2px_2px_0_0_#fff]` 
                    : `bg-mbare-black text-mbare-muted border-mbare-border ${cat.hover} hover:text-white`
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testo */}
        <div className="flex flex-col gap-2">
          <label htmlFor="spiffera-content" className="font-mono text-xs text-mbare-muted uppercase">
            La tua spifferata (Anonima)
          </label>
          <textarea
            id="spiffera-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Raga, dovete sapere cosa è successo..."
            className="w-full bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-lg text-mbare-white py-2 resize-none h-32 placeholder:text-mbare-border transition-colors font-sans"
            maxLength={1000}
          />
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-mbare-muted text-[10px] uppercase">Min 20 caratteri</span>
            <span className={`${isAlmostFull ? 'text-red-500 font-bold animate-pulse' : 'text-mbare-muted'}`}>
              {charCount}/1000
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="py-2 border-y border-mbare-border/50">
          <SpicyMeter value={spicyLevel} onChange={setSpicyLevel} />
        </div>

        {/* Bottone di Invio con Loader */}
        <button
          type="submit"
          disabled={isSubmitting || charCount < 20}
          style={{ backgroundColor: buttonColor }}
          className="relative w-full py-4 text-black font-display font-bold text-xl uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-black group overflow-hidden"
        >
          {/* Effetto hover shift */}
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Spifferando...
              </>
            ) : (
              'Lancia il Pettegolezzo 🫖'
            )}
          </span>
        </button>

        {!user && (
          <p className="text-center text-xs text-red-400/80 font-mono uppercase bg-red-500/10 py-2 border border-red-500/20">
            Devi effettuare l'accesso per spifferare.
          </p>
        )}
      </form>
    </div>
  );
}