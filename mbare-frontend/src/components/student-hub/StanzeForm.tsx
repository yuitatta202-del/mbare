import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function StanzeForm({ onSuccess, onCancel }: Props) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [formData, setFormData] = useState({
    type: 'OFFRO' as 'OFFRO' | 'CERCO',
    title: '',
    zone: '',
    price: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user) return setFeedback({ type: 'error', msg: 'Devi essere loggato per pubblicare un annuncio.' });
    if (formData.title.trim().length < 5) return setFeedback({ type: 'error', msg: 'Il titolo deve essere più descrittivo (min. 5 caratteri).' });
    if (formData.description.trim().length < 20) return setFeedback({ type: 'error', msg: 'La descrizione è troppo corta (min. 20 caratteri).' });

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const price = formData.price ? parseFloat(formData.price) : null;
      // I tag conterranno: Zona, Tipo
      const tags = [formData.zone.trim(), formData.type === 'OFFRO' ? 'Affitto' : 'Ricerca'].filter(Boolean);

      const res = await fetch(`${API_URL}/board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.description.trim(),
          category: 'STANZE',
          type: formData.type,
          tags,
          price: price && !isNaN(price) && price > 0 ? price : null
        })
      });

      if (!res.ok) throw new Error('Errore durante la pubblicazione');

      setFeedback({ type: 'success', msg: 'Annuncio pubblicato con successo!' });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Errore durante la pubblicazione.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-mbare-surface border-2 border-yellow-500 p-6 mb-10 flex flex-col gap-5 animate-slide-up relative">
      <div className="flex justify-between items-center border-b border-mbare-border pb-3">
        <h3 className="font-display font-bold uppercase text-xl text-white">Pubblica Annuncio Stanza</h3>
        <button type="button" onClick={onCancel} className="text-mbare-muted hover:text-red-500 font-mono text-xs uppercase">✕ Chiudi</button>
      </div>

      {feedback && (
        <div className={`p-3 text-sm font-sans border-l-4 ${feedback.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-mbare-muted uppercase">Cosa vuoi fare?</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setFormData({...formData, type: 'OFFRO'})}
            className={`flex-1 py-3 font-bold uppercase text-sm border-2 transition-all ${formData.type === 'OFFRO' ? 'bg-yellow-500 text-black border-yellow-500 shadow-[2px_2px_0_0_#fff]' : 'bg-transparent text-mbare-muted border-mbare-border hover:border-yellow-500'}`}>
            🏠 Offro una Stanza
          </button>
          <button type="button" onClick={() => setFormData({...formData, type: 'CERCO'})}
            className={`flex-1 py-3 font-bold uppercase text-sm border-2 transition-all ${formData.type === 'CERCO' ? 'bg-blue-500 text-white border-blue-500 shadow-[2px_2px_0_0_#fff]' : 'bg-transparent text-mbare-muted border-mbare-border hover:border-blue-500'}`}>
            🔍 Cerco una Stanza
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Titolo Annuncio *</label>
          <input type="text" placeholder="es. Stanza singola in centro, vicino metro" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-yellow-500 outline-none font-sans" required maxLength={60} />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Zona / Città *</label>
          <input type="text" placeholder="es. Catania Centro, Cibali" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-yellow-500 outline-none font-sans" required />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Prezzo (€/mese) - opzionale</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-display font-bold text-lg pointer-events-none">€</span>
            <input type="number" placeholder="es. 250" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-mbare-black border border-mbare-border text-white pl-10 pr-3 py-3 focus:border-yellow-500 outline-none font-mono text-sm" min="0" step="10" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-mbare-muted uppercase">Descrizione *</label>
        <textarea placeholder="Descrivi la stanza (arredata, wifi, spese incluse...) o cosa cerchi (budget, coinquilini, ecc.)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 h-32 focus:border-yellow-500 outline-none font-sans resize-none" required maxLength={1000} />
      </div>

      <button type="submit" disabled={isSubmitting} className="bg-mbare-white text-black font-bold uppercase py-4 hover:bg-yellow-500 hover:text-black transition-colors mt-2 disabled:opacity-50">
        {isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Annuncio'}
      </button>
      
      <p className="text-[10px] text-mbare-muted font-mono text-center uppercase mt-2">
        I contatti avverranno tramite la chat interna per evitare spam e truffe.
      </p>
    </form>
  );
}