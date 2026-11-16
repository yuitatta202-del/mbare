import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface OffertaLavoro {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: { username: string };
  createdAt: string;
}

// Colori per i tipi di contratto
const CONTRACT_COLORS: Record<string, string> = {
  'Tirocinio': 'bg-blue-500 text-white',
  'Full-time': 'bg-green-500 text-black',
  'Part-time': 'bg-yellow-500 text-black',
  'Freelance': 'bg-purple-500 text-white',
};

export function Stage() {
  const { user } = useUser();
  const [offerte, setOfferte] = useState<OffertaLavoro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Stato del form
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    contractType: 'Tirocinio',
    link: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // 1. Fetch delle offerte di lavoro
  const fetchOfferte = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (res.ok) {
        const data = await res.json();
        // Filtriamo per categoria STUDIO e tag STAGE_LAVORO
        const filtered = data.filter((ad: any) => 
          ad.category === 'STUDIO' && 
          ad.tags?.includes('STAGE_LAVORO')
        );
        setOfferte(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferte();
  }, []);

  // 2. Invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (!user) {
      setFeedback({ type: 'error', msg: 'Devi essere loggato per pubblicare un\'offerta.' });
      return;
    }
    if (!formData.jobTitle.trim() || !formData.company.trim()) {
      setFeedback({ type: 'error', msg: 'Inserisci almeno il titolo della posizione e l\'azienda.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const title = `${formData.jobTitle} - ${formData.company}`;
      const content = `[LINK]: ${formData.link}\n\n${formData.description}`.trim();
      
      // Tag: [STAGE_LAVORO, Azienda, Sede, TipoContratto]
      const tags = [
        'STAGE_LAVORO', 
        formData.company, 
        formData.location, 
        formData.contractType
      ].filter(Boolean);

      const res = await fetch(`${API_URL}/board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title,
          content,
          category: 'STUDIO',
          type: 'OFFRO', // Stiamo "offrendo" un lavoro
          tags
        })
      });

      if (!res.ok) throw new Error('Errore durante la pubblicazione');

      setFeedback({ type: 'success', msg: 'Offerta pubblicata con successo!' });
      setFormData({ jobTitle: '', company: '', location: '', contractType: 'Tirocinio', link: '', description: '' });
      
      setTimeout(() => {
        setShowForm(false);
        setFeedback(null);
        fetchOfferte();
      }, 1500);
      
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ahi ahi, qualcosa è andato storto. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtro di ricerca
  const filteredOfferte = offerte.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-mbare-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
            Stage & Lavoro<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">
            Prime opportunità, tirocini e lavoretti per entrare nel mondo del lavoro.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-mbare-accent text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-colors border-2 border-mbare-accent hover:border-white shadow-[4px_4px_0_0_#fff] whitespace-nowrap"
        >
          {showForm ? 'Annulla' : '+ Pubblica Offerta'}
        </button>
      </div>

      {/* FORM DI CARICAMENTO */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-mbare-surface border-2 border-mbare-accent p-6 flex flex-col gap-4 relative">
          <h3 className="font-display font-bold uppercase text-xl text-white border-b border-mbare-border pb-2 mb-2">
            Pubblica un'Opportunità
          </h3>
          
          {feedback && (
            <div className={`p-3 text-sm font-sans border-l-4 ${feedback.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
              {feedback.msg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Posizione (es. Frontend Developer)" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Azienda / Ente" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Sede (es. Catania, Remoto)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            
            <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none">
              <option value="Tirocinio">Tirocinio / Stage</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance / Progetto</option>
            </select>

            <input type="url" placeholder="Link per candidarsi / Info (opzionale)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none md:col-span-2" />
          </div>
          
          <textarea placeholder="Descrizione della posizione, requisiti, RAL..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 h-24 focus:border-mbare-accent outline-none resize-none" required />
          
          <button type="submit" disabled={isSubmitting} className="bg-mbare-white text-black font-bold uppercase py-3 hover:bg-mbare-accent hover:text-white transition-colors mt-2 disabled:opacity-50">
            {isSubmitting ? 'Pubblicazione...' : 'Pubblica Offerta'}
          </button>
        </form>
      )}

      {/* BARRA DI RICERCA */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mbare-muted group-focus-within:text-mbare-accent transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Cerca per posizione, azienda o sede..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-mbare-surface border-2 border-mbare-border text-white pl-12 pr-4 py-3 focus:border-mbare-accent outline-none font-sans"
        />
      </div>

      {/* GRIGLIA OFFERTE */}
      {loading ? (
        <div className="text-center py-12"><p className="text-mbare-muted font-mono animate-pulse">Caricando le offerte...</p></div>
      ) : filteredOfferte.length === 0 ? (
        <div className="text-center py-20 border-2 border-mbare-border border-dashed">
          <p className="text-mbare-muted font-mono text-lg uppercase">Nessuna offerta trovata.</p>
          <p className="text-mbare-border font-sans mt-2">Prova a cambiare ricerca o pubblica tu la prima opportunità!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOfferte.map((offerta) => {
            // Estraiamo il link dal contenuto
            const linkMatch = offerta.content.match(/\[LINK\]: (https?:\/\/[^\s]+)/);
            const link = linkMatch ? linkMatch[1] : null;
            const textContent = offerta.content.replace(/\[LINK\]:.*\n*/, '').trim();
            
            // Estraiamo azienda, sede e contratto dai tag
            const company = offerta.tags?.[1] || 'Azienda sconosciuta';
            const location = offerta.tags?.[2] || 'Sede non specificata';
            const contract = offerta.tags?.[3] || 'Tirocinio';
            
            const contractStyle = CONTRACT_COLORS[contract] || 'bg-gray-500 text-white';
            
            // Verifica se è nuovo (postato nelle ultime 24h)
            const isNew = (new Date().getTime() - new Date(offerta.createdAt).getTime()) < 24 * 60 * 60 * 1000;

            return (
              <div key={offerta.id} className="bg-mbare-surface border-2 border-mbare-border p-5 flex flex-col hover:border-mbare-accent transition-colors group relative">
                
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase ${contractStyle}`}>
                    {contract}
                  </span>
                  <div className="flex flex-col items-end">
                    {isNew && <span className="text-[9px] font-mono text-mbare-accent uppercase font-bold animate-pulse">Nuovo</span>}
                    <span className="font-mono text-[10px] text-mbare-muted">{new Date(offerta.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-display font-bold uppercase text-white group-hover:text-mbare-accent transition-colors leading-tight mb-1 line-clamp-2">
                  {offerta.title}
                </h3>
                
                <p className="text-sm font-mono text-mbare-accent uppercase mb-3">
                  {company} <span className="text-mbare-muted">• {location}</span>
                </p>

                {textContent && (
                  <p className="text-mbare-muted font-sans text-sm line-clamp-3 mb-4 flex-grow">
                    {textContent}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-mbare-border/50 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-mbare-muted uppercase">
                    by {offerta.author?.username || 'Studente'}
                  </span>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="bg-mbare-white text-black px-4 py-1.5 text-xs font-bold uppercase hover:bg-mbare-accent hover:text-white transition-colors">
                      Candidati →
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-mbare-muted border border-mbare-border px-2 py-1">Solo testo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}