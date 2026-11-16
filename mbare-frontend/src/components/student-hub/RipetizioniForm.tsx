import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

type Feedback = { type: 'success' | 'error'; message: string } | null;

export function RipetizioniForm({ onSuccess, onCancel }: Props) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Stato del form
  const [formData, setFormData] = useState({
    type: 'OFFRO' as 'OFFRO' | 'CERCO',
    subject: '',
    faculty: '',
    year: '',
    price: '',
    description: ''
  });

  // Auto-nascondi feedback dopo 5 secondi
  // (Lo facciamo al momento della richiesta, non con useEffect, per non incasinare)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user) {
      setFeedback({ type: 'error', message: 'Devi essere loggato per pubblicare un annuncio!' });
      return;
    }
    if (formData.subject.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Specifica almeno la materia (min. 3 caratteri).' });
      return;
    }
    if (formData.description.trim().length < 20) {
      setFeedback({ type: 'error', message: 'La descrizione deve essere di almeno 20 caratteri.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Costruiamo titolo e tag per la ricerca
      const action = formData.type === 'OFFRO' ? 'Offro' : 'Cerco';
      const title = `${action} ripetizioni di ${formData.subject}`;
      
      // I tag conterranno: materia, facoltà, anno
      const tags = [
        formData.subject.trim(),
        formData.faculty.trim(),
        formData.year.trim()
      ].filter(Boolean); // Rimuove stringhe vuote

      const price = formData.price ? parseFloat(formData.price) : null;

      const res = await fetch(`${API_URL}/board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title,
          content: formData.description.trim(),
          category: 'STUDIO',
          type: formData.type,
          tags,
          price: price && !isNaN(price) && price > 0 ? price : null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Errore durante la pubblicazione');
      }

      setFeedback({ type: 'success', message: 'Annuncio pubblicato con successo!' });
      
      // Aspetta 1.5 secondi per far vedere il messaggio, poi chiude il form
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante la pubblicazione.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setFeedback(null); // Pulisce feedback quando l'utente modifica
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-mbare-surface border-2 border-mbare-accent p-6 mb-10 flex flex-col gap-5 animate-slide-up relative"
    >
      {/* Header del form */}
      <div className="flex justify-between items-center border-b border-mbare-border pb-3">
        <h3 className="font-display font-bold uppercase text-xl text-white">
          Nuovo Annuncio Ripetizioni
        </h3>
        <button 
          type="button" 
          onClick={onCancel}
          className="text-mbare-muted hover:text-red-500 font-mono text-xs uppercase transition-colors"
        >
          ✕ Chiudi
        </button>
      </div>

      {/* Banner Feedback */}
      {feedback && (
        <div className={`p-3 text-sm font-sans border-l-4 animate-slide-up flex items-start gap-2 ${
          feedback.type === 'success' 
            ? 'bg-green-500/10 border-green-500 text-green-400' 
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
          <p>{feedback.message}</p>
        </div>
      )}

      {/* Selezione Tipo (Segmented Control) */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-mbare-muted uppercase">Cosa vuoi fare?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateField('type', 'OFFRO')}
            className={`flex-1 py-3 font-bold uppercase text-sm border-2 transition-all ${
              formData.type === 'OFFRO'
                ? 'bg-green-500 text-black border-green-500 shadow-[2px_2px_0_0_#fff]'
                : 'bg-transparent text-mbare-muted border-mbare-border hover:border-green-500'
            }`}
          >
            🎓 Offro Ripetizioni
          </button>
          <button
            type="button"
            onClick={() => updateField('type', 'CERCO')}
            className={`flex-1 py-3 font-bold uppercase text-sm border-2 transition-all ${
              formData.type === 'CERCO'
                ? 'bg-blue-500 text-white border-blue-500 shadow-[2px_2px_0_0_#fff]'
                : 'bg-transparent text-mbare-muted border-mbare-border hover:border-blue-500'
            }`}
          >
            🔍 Cerco Ripetizioni
          </button>
        </div>
      </div>

      {/* Materia, Facoltà, Anno (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Materia *</label>
          <input
            type="text"
            placeholder="es. Analisi 1, Diritto Privato, Inglese..."
            value={formData.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-sans text-sm"
            required
            maxLength={60}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Facoltà (opzionale)</label>
          <input
            type="text"
            placeholder="es. Ingegneria Informatica"
            value={formData.faculty}
            onChange={(e) => updateField('faculty', e.target.value)}
            className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-sans text-sm"
            maxLength={60}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Anno di corso (opzionale)</label>
          <input
            type="text"
            placeholder="es. 1° Anno, 3° Anno"
            value={formData.year}
            onChange={(e) => updateField('year', e.target.value)}
            className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-sans text-sm"
            maxLength={30}
          />
        </div>
      </div>

      {/* Prezzo */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-mbare-muted uppercase">
          Prezzo all'ora (€) - opzionale
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mbare-accent font-display font-bold text-lg pointer-events-none">
            €
          </span>
          <input
            type="number"
            placeholder="15"
            value={formData.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="w-full bg-mbare-black border border-mbare-border text-white pl-10 pr-3 py-3 focus:border-mbare-accent outline-none font-mono text-sm"
            min="0"
            step="0.50"
            maxLength={10}
          />
        </div>
        <p className="text-[10px] font-mono text-mbare-muted uppercase">
          Lascia vuoto se gratuito o da concordare
        </p>
      </div>

      {/* Descrizione */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-mbare-muted uppercase">Descrizione *</label>
        <textarea
          placeholder="Descrivi la tua disponibilità, dove abiti (zona), se fai online o in presenza, la tua esperienza..."
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="bg-mbare-black border border-mbare-border text-white p-3 h-32 focus:border-mbare-accent outline-none font-sans text-sm resize-none"
          required
          maxLength={500}
        />
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-mono text-mbare-muted uppercase">Min. 20 caratteri</p>
          <p className={`text-[10px] font-mono uppercase ${
            formData.description.length > 450 ? 'text-red-500 animate-pulse' : 'text-mbare-muted'
          }`}>
            {formData.description.length}/500
          </p>
        </div>
      </div>

      {/* Bottone Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full bg-mbare-white text-black font-display font-bold uppercase text-lg py-4 hover:bg-mbare-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-mbare-white hover:border-mbare-accent overflow-hidden group"
      >
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Pubblicazione in corso...
            </>
          ) : (
            `Pubblica Annuncio (${formData.type === 'OFFRO' ? 'Offro' : 'Cerco'})`
          )}
        </span>
      </button>
    </form>
  );
}