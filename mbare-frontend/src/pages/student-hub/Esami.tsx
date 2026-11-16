import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ProvaEsame {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: { username: string };
  createdAt: string;
}

export function Esami() {
  const { user } = useUser();
  const [esami, setEsami] = useState<ProvaEsame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Stato del form
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    professor: '',
    year: '',
    link: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // 1. Fetch delle prove d'esame
  const fetchEsami = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (res.ok) {
        const data = await res.json();
        // Filtriamo per categoria STUDIO e tag PROVA_ESAME
        const filtered = data.filter((ad: any) => 
          ad.category === 'STUDIO' && 
          ad.tags?.includes('PROVA_ESAME')
        );
        setEsami(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEsami();
  }, []);

  // 2. Invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (!user) {
      setFeedback({ type: 'error', msg: 'Devi essere loggato per caricare una prova.' });
      return;
    }
    if (!formData.link.trim() && !formData.description.trim()) {
      setFeedback({ type: 'error', msg: 'Inserisci un link o una descrizione della prova.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const title = `${formData.title} (${formData.year})`;
      const content = `[LINK]: ${formData.link}\n\n${formData.description}`.trim();
      
      // Tag: [PROVA_ESAME, Corso, Professore, Anno]
      const tags = ['PROVA_ESAME', formData.course, formData.professor, formData.year].filter(Boolean);

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
          type: 'REGALO',
          tags
        })
      });

      if (!res.ok) throw new Error('Errore durante il caricamento');

      setFeedback({ type: 'success', msg: 'Prova d\'esame condivisa con successo!' });
      setFormData({ title: '', course: '', professor: '', year: '', link: '', description: '' });
      
      setTimeout(() => {
        setShowForm(false);
        setFeedback(null);
        fetchEsami();
      }, 1500);
      
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ahi ahi, qualcosa è andato storto. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtro di ricerca
  const filteredEsami = esami.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-mbare-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
            Prove d'Esame<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">
            Tracce passate per non farti trovare impreparato davanti al professore.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-mbare-accent text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-colors border-2 border-mbare-accent hover:border-white shadow-[4px_4px_0_0_#fff] whitespace-nowrap"
        >
          {showForm ? 'Annulla' : '+ Carica Prova'}
        </button>
      </div>

      {/* FORM DI CARICAMENTO */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-mbare-surface border-2 border-mbare-accent p-6 flex flex-col gap-4 relative">
          <h3 className="font-display font-bold uppercase text-xl text-white border-b border-mbare-border pb-2 mb-2">
            Condividi una Prova d'Esame
          </h3>
          
          {feedback && (
            <div className={`p-3 text-sm font-sans border-l-4 ${feedback.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
              {feedback.msg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Titolo (es. Analisi 1 - Appello Gennaio)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Corso di Laurea (es. Ingegneria Informatica)" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Professore" value={formData.professor} onChange={e => setFormData({...formData, professor: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" />
            <input type="text" placeholder="Anno (es. 2023/2024)" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="url" placeholder="Link al PDF / Drive (opzionale)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none md:col-span-2" />
          </div>
          
          <textarea placeholder="Descrizione (es. Domande frequenti, esercizi, ecc.)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 h-24 focus:border-mbare-accent outline-none resize-none" />
          
          <button type="submit" disabled={isSubmitting} className="bg-mbare-white text-black font-bold uppercase py-3 hover:bg-mbare-accent hover:text-white transition-colors mt-2 disabled:opacity-50">
            {isSubmitting ? 'Caricamento...' : 'Pubblica Prova'}
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
          placeholder="Cerca per materia, professore o anno..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-mbare-surface border-2 border-mbare-border text-white pl-12 pr-4 py-3 focus:border-mbare-accent outline-none font-sans"
        />
      </div>

      {/* GRIGLIA ESAMI */}
      {loading ? (
        <div className="text-center py-12"><p className="text-mbare-muted font-mono animate-pulse">Caricando le prove...</p></div>
      ) : filteredEsami.length === 0 ? (
        <div className="text-center py-20 border-2 border-mbare-border border-dashed">
          <p className="text-mbare-muted font-mono text-lg uppercase">Nessuna prova trovata.</p>
          <p className="text-mbare-border font-sans mt-2">Prova a cambiare ricerca o carica tu la prima traccia!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEsami.map((esame) => {
            // Estraiamo il link dal contenuto
            const linkMatch = esame.content.match(/\[LINK\]: (https?:\/\/[^\s]+)/);
            const link = linkMatch ? linkMatch[1] : null;
            const textContent = esame.content.replace(/\[LINK\]:.*\n*/, '').trim();
            
            // Estraiamo corso, professore, anno dai tag
            const course = esame.tags?.find(t => t !== 'PROVA_ESAME') || 'Corso generico';
            const prof = esame.tags?.length > 2 ? esame.tags[2] : null;
            const year = esame.tags?.length > 3 ? esame.tags[3] : null;

            return (
              <div key={esame.id} className="bg-mbare-surface border-2 border-mbare-border p-5 flex flex-col hover:border-mbare-accent transition-colors group relative">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase">Esame</span>
                  <span className="font-mono text-[10px] text-mbare-muted">{new Date(esame.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                
                <h3 className="text-lg font-display font-bold uppercase text-white group-hover:text-mbare-accent transition-colors leading-tight mb-2 line-clamp-2">
                  {esame.title}
                </h3>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[10px] font-mono uppercase text-mbare-accent border border-mbare-accent px-1.5 py-0.5">
                    {course}
                  </span>
                  {prof && (
                    <span className="text-[10px] font-mono uppercase text-mbare-muted border border-mbare-border px-1.5 py-0.5">
                      Prof. {prof}
                    </span>
                  )}
                  {year && (
                    <span className="text-[10px] font-mono uppercase text-mbare-muted border border-mbare-border px-1.5 py-0.5">
                      {year}
                    </span>
                  )}
                </div>

                {textContent && (
                  <p className="text-mbare-muted font-sans text-sm line-clamp-3 mb-4 flex-grow">
                    {textContent}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-mbare-border/50 flex items-center justify-between">
                  <span className="font-mono text-xs text-mbare-muted uppercase">
                    by {esame.author?.username || 'Studente'}
                  </span>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="bg-mbare-white text-black px-4 py-1.5 text-xs font-bold uppercase hover:bg-mbare-accent hover:text-white transition-colors">
                      Apri File →
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-mbare-muted">Solo testo</span>
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