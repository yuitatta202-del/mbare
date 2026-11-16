import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Icona basata sulla materia (per rendere visivamente riconoscibile l'annuncio)
const getSubjectIcon = (tags: string[] = []) => {
  const text = tags.join(' ').toLowerCase();
  if (text.match(/matematica|analisi|algebra|geometria|fisica|statistica/)) return '📐';
  if (text.match(/diritto|giurisprudenza|legge/)) return '⚖️';
  if (text.match(/ingegneria|informatica|programmazione|python|java|c\+\+/)) return '💻';
  if (text.match(/chimica|biologia|medicina|anatomia/)) return '🧪';
  if (text.match(/economia|finanza|contabilità|ragioneria/)) return '💰';
  if (text.match(/inglese|spagnolo|francese|tedesco|lingua/)) return '🗣️';
  if (text.match(/italiano|latino|greco|letteratura|storia|filosofia/)) return '📖';
  return '🎓'; // Default
};

export function RipetizioniCard({ ad }: { ad: any }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isConfirmingReport, setIsConfirmingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isReporting, setIsReporting] = useState(false);

  // Auto-nasconde il messaggio di successo della segnalazione dopo 4 secondi
  useEffect(() => {
    if (reportStatus === 'success') {
      const timer = setTimeout(() => setReportStatus('idle'), 4000);
      return () => clearTimeout(timer);
    }
  }, [reportStatus]);

  // Verifica se l'annuncio è stato pubblicato nelle ultime 24 ore
  const isNew = () => {
    const created = new Date(ad.createdAt || ad.created_at);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
  };

  // Formattazione data
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Gestione clic su "Contatta"
  const handleContact = () => {
    if (!user) {
      return alert("Devi essere loggato per contattare l'autore!");
    }
    // Porta l'utente alla chat (in futuro potrai passare l'ID dell'utente)
    navigate('/chat');
  };

  // Gestione segnalazione annuncio
  const handleReport = async () => {
    if (!user) return alert("Devi essere loggato per segnalare.");
    setIsReporting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          target_type: 'POST',
          target_id: ad.id,
          reason: 'OTHER',
          note: 'Annuncio ripetizioni segnalato dal feed pubblico'
        })
      });

      if (!res.ok) throw new Error();
      
      setReportStatus('success');
      setIsConfirmingReport(false);
    } catch (err) {
      setReportStatus('error');
      setIsConfirmingReport(false);
    } finally {
      setIsReporting(false);
    }
  };

  // Estrazione dei tag in modo sicuro
  const tags: string[] = Array.isArray(ad.tags) ? ad.tags : [];
  const subject = tags[0] || 'Materia';
  const faculty = tags[1] || '';
  const year = tags[2] || '';
  const icon = getSubjectIcon(tags);

  const isOffering = ad.type === 'OFFRO';
  const price = ad.price ? Number(ad.price) : null;
  const authorName = ad.author?.username || 'Studente';

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border hover:border-mbare-accent hover:shadow-[6px_6px_0_0_#ff3b00] hover:-translate-y-1 transition-all duration-300 relative group flex flex-col">
      
      {/* HEADER: Tipo, Nuovo, Segnalazione */}
      <div className="p-5 pb-3 flex justify-between items-start border-b border-mbare-border/50">
        <div className="flex flex-col gap-2">
          <span className={`text-[10px] font-bold px-2 py-1 uppercase w-fit ${
            isOffering 
              ? 'bg-green-500 text-black' 
              : 'bg-blue-500 text-white'
          }`}>
            {isOffering ? 'Offro' : 'Cerco'}
          </span>
          {isNew() && (
            <span className="text-[9px] font-mono text-mbare-accent uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-mbare-accent rounded-full animate-pulse"></span>
              Nuovo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-mbare-muted uppercase">
            {formatDate(ad.createdAt || ad.created_at)}
          </span>

          {/* Gestione Segnalazione Inline */}
          {reportStatus === 'success' ? (
            <span className="text-[9px] font-mono text-green-500 uppercase">Inviata ✓</span>
          ) : reportStatus === 'error' ? (
            <span className="text-[9px] font-mono text-red-500 uppercase">Errore</span>
          ) : isConfirmingReport ? (
            <div className="flex items-center gap-1 animate-slide-up">
              <button 
                onClick={handleReport} 
                disabled={isReporting}
                className="text-[9px] font-bold uppercase text-red-500 hover:text-white hover:bg-red-500 px-1.5 py-0.5 border border-red-500 transition-colors"
              >
                {isReporting ? '...' : 'Sì'}
              </button>
              <button 
                onClick={() => setIsConfirmingReport(false)} 
                className="text-[9px] font-bold uppercase text-mbare-muted hover:text-white px-1"
              >
                No
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsConfirmingReport(true)}
              title="Segnala annuncio"
              className="text-mbare-muted hover:text-red-500 transition-colors opacity-40 group-hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* BODY: Icona, Titolo, Tag, Descrizione */}
      <div className="p-5 flex-grow flex flex-col">
        
        {/* Icona Materia + Titolo */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-mbare-black border border-mbare-border flex items-center justify-center text-2xl shrink-0 group-hover:bg-mbare-accent transition-colors">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-display font-bold uppercase text-white group-hover:text-mbare-accent transition-colors leading-tight line-clamp-2">
              {subject}
            </h3>
            {faculty && (
              <p className="text-[10px] font-mono text-mbare-muted uppercase mt-1 line-clamp-1">
                {faculty} {year && `• ${year}`}
              </p>
            )}
          </div>
        </div>

        {/* Descrizione */}
        <p className="text-mbare-muted font-sans text-sm line-clamp-3 mb-4 flex-grow">
          {ad.content}
        </p>

        {/* Prezzo se presente */}
        {price !== null && price > 0 && (
          <div className="flex items-baseline gap-1 mb-2">
            <span className="font-display font-bold text-2xl text-mbare-accent">
              €{price.toFixed(2)}
            </span>
            <span className="font-mono text-[10px] text-mbare-muted uppercase">/ ora</span>
          </div>
        )}
      </div>

      {/* FOOTER: Autore e Contatta */}
      <div className="p-4 border-t border-mbare-border/50 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-mbare-accent text-black flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {authorName.charAt(0)}
          </div>
          <span className="font-mono text-[10px] text-mbare-muted uppercase truncate">
            {authorName}
          </span>
        </div>
        
        <button 
          onClick={handleContact}
          className="bg-mbare-white text-black px-4 py-2 text-[10px] font-bold uppercase hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent whitespace-nowrap"
        >
          Contatta →
        </button>
      </div>

    </div>
  );
}