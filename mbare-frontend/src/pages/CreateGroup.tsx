import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // <-- Importiamo supabase

export function CreateGroup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // <-- Stato per gli errori

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'STUDIO',
    city: '',
    maxMembers: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Prendi la sessione per il token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Devi essere loggato per creare un gruppo");

      // 2. Chiama l'API del backend
      const res = await fetch('http://localhost:3001/api/groups', { // <-- URL corretto
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          maxMembers: Number(formData.maxMembers) // Assicurati che sia un numero
        })
      });

      // 3. Gestisci la risposta
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore durante la creazione');
      }

      // Successo
      alert('Gruppo creato con successo!');
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
          Crea Gruppo<span className="text-mbare-accent">.</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-mbare-surface p-8 border-2 border-mbare-border">
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Nome del Gruppo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="es. Gruppo Studio Analisi 1"
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
                <option value="STUDIO">Studio</option>
                <option value="HOBBY">Hobby</option>
                <option value="SPORT">Sport</option>
                <option value="ALTRO">Altro</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Città</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="es. Catania"
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
              placeholder="Di cosa si occupa il gruppo?"
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Numero Massimo di Membri</label>
            <input
              type="number"
              min={2}
              max={50}
              value={formData.maxMembers}
              onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
            />
          </div>

          {error && <p className="text-mbare-accent font-mono text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-mbare-white text-mbare-black py-4 font-display font-bold text-xl uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Creazione...' : 'Crea Gruppo'}
          </button>
        </form>
      </div>
    </div>
  );
}