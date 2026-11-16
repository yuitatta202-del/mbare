import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { CommentSection } from '../comments/CommentSection'; // <-- IMPORT AGGIUNTO

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIES = [
  { id: 'SPICY', label: 'Spicy 🌶️', color: 'bg-red-500' },
  { id: 'CRINGE', label: 'Cringe 💀', color: 'bg-gray-500' },
  { id: 'UNI', label: 'Vita Uni 🎓', color: 'bg-blue-500' },
  { id: 'DRAMA', label: 'Drama 👀', color: 'bg-purple-500' },
  { id: 'UNPOPULAR', label: 'Unpopular 🗣️', color: 'bg-yellow-500' },
];

export function SpifferaCard({ conf, onRefresh }: { conf: any, onRefresh: () => void }) {
  const { user } = useUser();
  
  // Stati per il voto
  const [isRating, setIsRating] = useState(false);
  const [tempRating, setTempRating] = useState(conf.spicyLevel || conf.spicy_level || 50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stati per la segnalazione
  const [isConfirmingReport, setIsConfirmingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Stato per mostrare/nascondere i commenti
  const [showComments, setShowComments] = useState(false);

  const cat = CATEGORIES.find(c => c.id === conf.category) || CATEGORIES[0];
  const dateStr = conf.createdAt || conf.created_at;
  const currentSpicyLevel = conf.spicyLevel || conf.spicy_level || 50;

  // Auto-nasconde il messaggio di successo della segnalazione dopo 4 secondi
  useEffect(() => {
    if (reportStatus === 'success') {
      const timer = setTimeout(() => setReportStatus('idle'), 4000);
      return () => clearTimeout(timer);
    }
  }, [reportStatus]);

  // Gestione del voto
  const handleRate = async () => {
    if (!user) return alert("Devi essere loggato per votare.");
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/confessions/${conf.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ rating: tempRating })
      });
      setIsRating(false);
      onRefresh(); // Ricarica la media dal server
    } catch (err) {
      alert("Errore durante l'invio del voto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestione Segnalazione
  const handleReport = async () => {
    if (!user) return alert("Devi essere loggato per segnalare.");
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          target_type: 'CONFESSION',
          target_id: conf.id,
          reason: 'OTHER',
          note: 'Segnalata dal feed pubblico'
        })
      });

      if (!res.ok) throw new Error();
      
      setReportStatus('success');
      setIsConfirmingReport(false);
    } catch (err) {
      setReportStatus('error');
      setIsConfirmingReport(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funzione per il colore dinamico dello slider in base al valore
  const getSpicyColor = (val: number) => {
    if (val >= 70) return 'text-red-500';
    if (val >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-5 md:p-6 hover:border-mbare-accent transition-all duration-300 relative group flex flex-col">
      
      {/* HEADER: Categoria, Data e Segnalazione */}
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-bold px-2 py-1 uppercase text-black ${cat.color}`}>
          {cat.label}
        </span>
        
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-mbare-muted uppercase">
            {dateStr ? new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : ''}
          </span>
          
          {/* Gestione Segnalazione Inline */}
          {reportStatus === 'success' ? (
            <span className="text-[10px] font-mono text-green-500 uppercase animate-slide-up">Inviata ✓</span>
          ) : isConfirmingReport ? (
            <div className="flex items-center gap-1 animate-slide-up">
              <span className="text-[10px] text-mbare-muted font-mono uppercase mr-1">Sicuro?</span>
              <button 
                onClick={handleReport} 
                disabled={isSubmitting}
                className="text-[10px] font-bold uppercase text-red-500 hover:text-white hover:bg-red-500 px-2 py-0.5 border border-red-500 transition-colors"
              >
                {isSubmitting ? '...' : 'Sì'}
              </button>
              <button 
                onClick={() => setIsConfirmingReport(false)} 
                className="text-[10px] font-bold uppercase text-mbare-muted hover:text-white px-2 py-0.5"
              >
                No
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsConfirmingReport(true)}
              title="Segnala agli admin"
              className="text-mbare-muted hover:text-red-500 transition-colors opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* CONTENUTO DELLA SPIFFERA */}
      <p className="text-base md:text-lg font-sans text-mbare-white mb-5 leading-relaxed flex-grow">
        "{conf.content}"
      </p>

      {/* FOOTER: Rating e Ricompense */}
      <div className="flex flex-col gap-3 border-t border-mbare-border/50 pt-4 mt-auto">
        
        {/* Messaggio di errore segnalazione (se fallisce) */}
        {reportStatus === 'error' && (
          <p className="text-[10px] text-red-500 font-mono uppercase">Errore durante l'invio.</p>
        )}

        <div className="flex justify-between items-center">
          
          {/* Interfaccia di Rating "Pro" */}
          {isRating ? (
            <div className="flex items-center gap-2 bg-mbare-black p-1.5 border-2 border-mbare-accent rounded-none w-full animate-slide-up relative">
              <span className={`text-lg ${getSpicyColor(tempRating)} transition-colors`}>🌶️</span>
              <input 
                type="range" min="0" max="100" value={tempRating} 
                onChange={(e) => setTempRating(Number(e.target.value))}
                className="flex-1 accent-mbare-accent h-1.5 bg-mbare-border rounded-lg appearance-none cursor-pointer"
              />
              <span className={`font-mono text-xs w-10 text-center font-bold ${getSpicyColor(tempRating)}`}>
                {tempRating}%
              </span>
              
              <div className="flex gap-1 border-l border-mbare-border pl-2">
                <button 
                  onClick={handleRate}
                  disabled={isSubmitting}
                  className="bg-mbare-accent text-black px-2 py-1 text-[10px] font-bold uppercase hover:bg-white transition-colors"
                >
                  {isSubmitting ? '...' : 'Salva'}
                </button>
                <button 
                  onClick={() => setIsRating(false)} 
                  className="text-mbare-muted hover:text-red-500 text-[10px] font-bold px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => { setIsRating(true); setTempRating(currentSpicyLevel); }}
                className="text-[10px] font-mono uppercase text-mbare-white bg-mbare-black border border-mbare-border px-3 py-1.5 hover:border-mbare-accent hover:text-mbare-accent transition-all flex items-center gap-2"
              >
                <span>Valuta</span>
                <span className="text-mbare-muted group-hover:text-inherit">→</span>
              </button>

              {/* BOTTONE COMMENTI AGGIUNTO */}
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`text-[10px] font-mono uppercase border border-mbare-border px-3 py-1.5 transition-all flex items-center gap-2 ${
                  showComments ? 'bg-mbare-accent text-black border-mbare-accent font-bold' : 'text-mbare-white bg-mbare-black hover:border-mbare-accent hover:text-mbare-accent'
                }`}
              >
                <span>Commenti</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
              </button>
            </div>
          )}

          {/* Info Spicy Level Attuale */}
          {!isRating && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className={`text-sm ${getSpicyColor(currentSpicyLevel)}`}>🌶️</span>
                <span className={`font-mono text-sm font-bold ${getSpicyColor(currentSpicyLevel)}`}>
                  {currentSpicyLevel}% <span className="text-[10px] text-mbare-muted font-normal uppercase">Media</span>
                </span>
              </div>
              <span className="text-[9px] text-mbare-muted font-mono uppercase mt-0.5 tracking-wider">
                +{currentSpicyLevel >= 70 ? '0.50' : '0.01'} 🪙 per voto
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SEZIONE COMMENTI (Appare solo se showComments è true) */}
      {showComments && (
        <div className="mt-4 pt-4 border-t-2 border-mbare-border/50 animate-slide-up">
          <CommentSection targetType="CONFESSION" targetId={conf.id} />
        </div>
      )}
    </div>
  );
}