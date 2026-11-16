import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { CommentItem } from './CommentItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Props {
  targetType: 'POST' | 'CONFESSION';
  targetId: string | number;
}

// Stato per i messaggi di feedback (Invia commento)
type Feedback = { type: 'success' | 'pending' | 'error'; message: string } | null;

export function CommentSection({ targetType, targetId }: Props) {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comments/${targetType}/${targetId}`);
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId]);

  // Auto-nascondi il feedback dopo 6 secondi
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user) {
      setFeedback({ type: 'error', message: "Devi essere loggato per commentare!" });
      return;
    }
    if (content.trim().length === 0) {
      setFeedback({ type: 'error', message: "Scrivi qualcosa, non puoi inviare un commento vuoto." });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/comments/${targetType}/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          authorName: authorName.trim() || null,
          parentId: replyTo?.id || null
        })
      });

      const data = await res.json();

      // Se il backend risponde con un errore (es. blacklist)
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }

      // Controlla lo status del commento (approved o pending)
      if (data.status === 'pending') {
        setFeedback({ 
          type: 'pending', 
          message: "Il tuo commento è in attesa di approvazione da parte di un admin." 
        });
      } else {
        setFeedback({ 
          type: 'success', 
          message: "Commento pubblicato con successo!" 
        });
      }

      // Reset del form in entrambi i casi (approved o pending)
      setContent('');
      setAuthorName('');
      setReplyTo(null);
      
      // Ricarica i commenti (se è pending non apparirà, ma aggiorna la lista)
      fetchComments();

    } catch (err: any) {
      // Gestisce errori di rete o errori 400 (blacklist)
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t-2 border-mbare-border/50">
      <h4 className="font-display font-bold text-lg text-white uppercase mb-4 flex items-center gap-2">
        Discussione <span className="text-mbare-accent text-sm">({comments.length})</span>
      </h4>

      {/* Lista Commenti */}
      {loading ? (
        <p className="text-mbare-muted font-mono text-sm animate-pulse mb-6">Caricando i commenti...</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {comments.length === 0 ? (
            <p className="text-mbare-muted font-mono text-xs uppercase opacity-50">Nessun commento. Rompi il silenzio.</p>
          ) : (
            comments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReply={(c) => {
                  setReplyTo(c);
                  setFeedback(null); // Pulisci feedback quando rispondi
                }}
                onRefresh={fetchComments}
              />
            ))
          )}
        </div>
      )}

      {/* Form di Inserimento */}
      <form onSubmit={handleSubmit} className="bg-mbare-surface border-2 border-mbare-border p-4 flex flex-col gap-3 relative">
        
        {/* Banner di Feedback (Successo / Pending / Errore) */}
        {feedback && (
          <div className={`p-3 text-sm font-sans border-l-4 animate-slide-up flex items-start gap-2 ${
            feedback.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' :
            feedback.type === 'pending' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
            'bg-red-500/10 border-red-500 text-red-400'
          }`}>
            <span>
              {feedback.type === 'success' ? '✅' : feedback.type === 'pending' ? '⏳' : '⚠️'}
            </span>
            <p>{feedback.message}</p>
          </div>
        )}

        {replyTo && (
          <div className="flex justify-between items-center bg-mbare-black px-3 py-2 border-l-2 border-mbare-accent">
            <span className="text-xs font-mono text-mbare-muted">
              Rispondendo a: <span className="text-mbare-accent font-bold">{replyTo.displayName}</span>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-red-500 font-bold hover:text-white">✕</button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Il tuo nome (o vuoto per anonimo)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full md:w-1/3 bg-mbare-black border border-mbare-border text-white text-sm p-3 focus:border-mbare-accent outline-none font-mono"
            maxLength={30}
          />
          <input
            type="text"
            placeholder="Scrivi un commento..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-mbare-black border border-mbare-border text-white text-sm p-3 focus:border-mbare-accent outline-none font-sans"
            maxLength={500}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-mbare-white text-black px-6 py-3 font-bold uppercase text-sm hover:bg-mbare-accent hover:text-white transition-colors disabled:opacity-50 border-2 border-mbare-white hover:border-mbare-accent min-w-[100px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
            ) : 'Invia'}
          </button>
        </div>
        {!user && <p className="text-xs text-red-500 font-mono mt-1">Devi essere loggato per commentare.</p>}
      </form>
    </div>
  );
}