import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Dispensa {
  id: string;
  title: string;
  content: string; // Qui metteremo il link o il testo
  tags: string[];
  author: { username: string };
  createdAt: string;
}

export function Dispense() {
  const { user } = useUser();
  const [dispense, setDispense] = useState<Dispensa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Stato del form
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    professor: '',
    link: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // 1. Fetch delle dispense
  const fetchDispense = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (res.ok) {
        const data = await res.json();
        // Filtriamo solo gli annunci di categoria STUDIO che hanno il tag DISPENSA
        const filtered = data.filter((ad: any) => 
          ad.category === 'STUDIO' && 
          ad.tags?.includes('DISPENSA')
        );
        setDispense(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispense();
  }, []);

  // 2. Invio del form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (!user) {
      setFeedback({ type: 'error', msg: 'Devi essere loggato per caricare dispense.' });
      return;
    }
    if (!formData.link.trim() && !formData.description.trim()) {
      setFeedback({ type: 'error', msg: 'Inserisci un link o una descrizione testuale.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const title = `${formData.title} - ${formData.course}`;
      const content = `[LINK]: ${formData.link}\n\n${formData.description}`.trim();
      
      // Tag: [DISPENSA, Corso, Professore]
      const tags = ['DISPENSA', formData.course, formData.professor].filter(Boolean);

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
          type: 'REGALO', // Le dispense sono gratuite
          tags
        })
      });

      if (!res.ok) throw new Error('Errore durante il caricamento');

      setFeedback({ type: 'success', msg: 'Dispensa condivisa con successo!' });
      setFormData({ title: '', course: '', professor: '', link: '', description: '' });
      
      // Chiudi il form e ricarica dopo 1.5s
      setTimeout(() => {
        setShowForm(false);
        setFeedback(null);
        fetchDispense();
      }, 1500);
      
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Ahi ahi, qualcosa è andato storto. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtro di ricerca
  const filteredDispense = dispense.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-mbare-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
            Dispense & Appunti<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">
            Sbircia gli appunti degli altri o condividi i tuoi. Salva la sessione.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-mbare-accent text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-colors border-2 border-mbare-accent hover:border-white shadow-[4px_4px_0_0_#fff] whitespace-nowrap"
        >
          {showForm ? 'Annulla' : '+ Carica Dispensa'}
        </button>
      </div>

      {/* FORM DI CARICAMENTO */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-mbare-surface border-2 border-mbare-accent p-6 flex flex-col gap-4 relative">
          <h3 className="font-display font-bold uppercase text-xl text-white border-b border-mbare-border pb-2 mb-2">
            Condividi i tuoi Appunti
          </h3>
          
          {feedback && (
            <div className={`p-3 text-sm font-sans border-l-4 ${feedback.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}>
              {feedback.msg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Titolo (es. Riassunto Analisi 1)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Corso (es. Ingegneria Informatica)" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" required />
            <input type="text" placeholder="Professore (opzionale)" value={formData.professor} onChange={e => setFormData({...formData, professor: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" />
            <input type="url" placeholder="Link a Google Drive / PDF (opzionale)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" />
          </div>
          
          <textarea placeholder="Descrizione o testo degli appunti..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-3 h-24 focus:border-mbare-accent outline-none resize-none" />
          
          <button type="submit" disabled={isSubmitting} className="bg-mbare-white text-black font-bold uppercase py-3 hover:bg-mbare-accent hover:text-white transition-colors mt-2 disabled:opacity-50">
            {isSubmitting ? 'Caricamento...' : 'Pubblica Dispensa'}
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
          placeholder="Cerca per materia, corso o professore..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-mbare-surface border-2 border-mbare-border text-white pl-12 pr-4 py-3 focus:border-mbare-accent outline-none font-sans"
        />
      </div>

      {/* GRIGLIA DISPENSE */}
      {loading ? (
        <div className="text-center py-12"><p className="text-mbare-muted font-mono animate-pulse">Caricando gli appunti...</p></div>
      ) : filteredDispense.length === 0 ? (
        <div className="text-center py-20 border-2 border-mbare-border border-dashed">
          <p className="text-mbare-muted font-mono text-lg uppercase">Nessuna dispensa trovata.</p>
          <p className="text-mbare-border font-sans mt-2">Prova a cambiare ricerca o carica tu il primo file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDispense.map((dispensa) => {
            // Estraiamo il link dal contenuto (formato: [LINK]: url \n\n descrizione)
            const linkMatch = dispensa.content.match(/\[LINK\]: (https?:\/\/[^\s]+)/);
            const link = linkMatch ? linkMatch[1] : null;
            const textContent = dispensa.content.replace(/\[LINK\]:.*\n*/, '').trim();
            
            // Estraiamo corso e professore dai tag
            const course = dispensa.tags?.find(t => t !== 'DISPENSA') || 'Corso generico';
            const prof = dispensa.tags?.length && dispensa.tags.length > 2 ? dispensa.tags[2] : null;

            return (
              <div key={dispensa.id} className="bg-mbare-surface border-2 border-mbare-border p-5 flex flex-col hover:border-mbare-accent transition-colors group relative">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-500 text-black text-[10px] font-bold px-2 py-1 uppercase">Appunti</span>
                  <span className="font-mono text-[10px] text-mbare-muted">{new Date(dispensa.createdAt).toLocaleDateString('it-IT')}</span>
                </div>
                
                <h3 className="text-lg font-display font-bold uppercase text-white group-hover:text-mbare-accent transition-colors leading-tight mb-2 line-clamp-2">
                  {dispensa.title}
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
                </div>

                {textContent && (
                  <p className="text-mbare-muted font-sans text-sm line-clamp-3 mb-4 flex-grow">
                    {textContent}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-mbare-border/50 flex items-center justify-between">
                  <span className="font-mono text-xs text-mbare-muted uppercase">
                    by {dispensa.author?.username || 'Studente'}
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