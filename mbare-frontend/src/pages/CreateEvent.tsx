import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SERATA',
    location: '',
    city: '',
    eventDate: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Prendi la sessione e assicurati che il token sia fresco
      // Forziamo un getUser() per validare la sessione e, se scaduta, rinnovarla
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Sessione scaduta o non valida. Effettua di nuovo il login.");
      }

      // Ora otteniamo la sessione (che dovrebbe avere il token aggiornato)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Token non trovato. Effettua di nuovo il login.");
      }

      // 2. Chiama l'API
      const res = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // <-- Invia il token
        },
        body: JSON.stringify({
          ...formData,
          eventDate: new Date(formData.eventDate).toISOString(), 
        })
      });

      // 3. Gestisci la risposta
      if (!res.ok) {
        const errorData = await res.json();
        // Se il token è scaduto, forziamo il logout
        if (res.status === 401) {
          await supabase.auth.signOut();
          throw new Error("Sessione scaduta. Effettua di nuovo il login.");
        }
        throw new Error(errorData.error || 'Errore durante la creazione');
      }

      // Successo
      alert('Evento creato! In attesa di approvazione da parte dell\'admin.');
      navigate('/community');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <Link to="/community" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-4 block">
          ← Torna alla Community
        </Link>
        
        <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-8 border-b-2 border-mbare-border pb-4">
          Crea Evento<span className="text-mbare-accent">.</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-mbare-surface p-8 border-2 border-mbare-border">
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Titolo Evento</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="es. Serata Mbare Vol. 01"
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="bg-mbare-black border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2 cursor-pointer"
              >
                <option value="SERATA">Serata</option>
                <option value="APERITIVO">Aperitivo</option>
                <option value="SPORT">Sport</option>
                <option value="CULTURA">Cultura</option>
                <option value="VIAGGIO">Viaggio</option>
                <option value="ALTRO">Altro</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Data e Ora</label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Città</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="es. Milano"
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Luogo (indirizzo)</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="es. Via Roma 1"
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Descrizione</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Racconta di cosa si tratta..."
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">URL Immagine (opzionale)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://..."
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
            />
          </div>

          {error && <p className="text-mbare-accent font-mono text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-mbare-white text-mbare-black py-4 font-display font-bold text-xl uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Creazione in corso...' : 'Pubblica Evento'}
          </button>
        </form>
      </div>
    </div>
  );
}