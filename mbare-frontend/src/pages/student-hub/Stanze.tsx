import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { StanzeForm } from '../../components/student-hub/StanzeForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function Stanze() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [stanze, setStanze] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'TUTTI' | 'OFFRO' | 'CERCO'>('TUTTI');
  const [showForm, setShowForm] = useState(false);

  // 1. Caricamento Annunci
  const fetchStanze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (res.ok) {
        const data = await res.json();
        // Filtriamo solo gli annunci di categoria 'STANZE'
        setStanze(data.filter((ad: any) => ad.category === 'STANZE'));
      }
    } catch (err) {
      console.error('Errore caricamento stanze:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStanze();
  }, []);

  // 2. Logica di Contatto (Reindirizza alla Chat)
  const handleContact = (authorName: string) => {
    if (!user) {
      alert("Devi essere loggato per contattare l'autore.");
      return;
    }
    // In futuro potrai passare l'ID dell'autore per aprire direttamente la chat
    // navigate(`/chat?with=${authorId}`);
    alert(`Stai per aprire una chat con ${authorName}. Verrai reindirizzato alla pagina dei messaggi.`);
    navigate('/chat');
  };

  // 3. Filtri e Ricerca
  const filteredStanze = stanze.filter(s => {
    const matchesType = filterType === 'TUTTI' || s.type === filterType;
    const searchString = `${s.title} ${s.content} ${s.tags?.join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-mbare-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
            Stanze<span className="text-yellow-500">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">
            Trova la tua stanza ideale o affitta la tua. Niente truffe, solo roba vera.
          </p>
        </div>
        <button 
          onClick={() => user ? setShowForm(!showForm) : navigate('/login')}
          className="bg-yellow-500 text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-colors border-2 border-yellow-500 hover:border-white shadow-[4px_4px_0_0_#fff] whitespace-nowrap"
        >
          {showForm ? 'Annulla' : '+ Pubblica Annuncio'}
        </button>
      </div>

      {/* FORM DI PUBBLICAZIONE (Appare solo se showForm è true) */}
      {showForm && (
        <StanzeForm 
          onSuccess={() => { 
            setShowForm(false); 
            fetchStanze(); 
          }} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {/* FILTRI E RICERCA */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 font-mono text-xs uppercase shrink-0">
          {['TUTTI', 'OFFRO', 'CERCO'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilterType(f as any)}
              className={`px-4 py-2 border-2 transition-colors ${
                filterType === f 
                  ? (f === 'OFFRO' ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : f === 'CERCO' ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'bg-mbare-white text-black border-mbare-white font-bold')
                  : 'text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Cerca per zona, titolo o parola chiave..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-mbare-surface border-2 border-mbare-border text-white p-2 px-4 focus:border-yellow-500 outline-none font-sans text-sm h-full"
          />
        </div>
      </div>

      {/* LISTA ANNUNCI */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-mbare-muted font-mono animate-pulse uppercase tracking-widest">Caricando le stanze...</p>
        </div>
      ) : filteredStanze.length === 0 ? (
        <div className="text-center py-20 border-2 border-mbare-border border-dashed flex flex-col items-center">
          <span className="text-5xl block mb-4 opacity-50">🏠</span>
          <p className="text-mbare-muted font-mono text-lg uppercase">Nessuna stanza trovata.</p>
          <p className="text-mbare-border font-sans mt-2">Prova a cambiare filtro o pubblica tu il primo annuncio!</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilterType('TUTTI'); }}
            className="mt-6 bg-mbare-white text-black px-6 py-2 font-bold uppercase text-sm hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent"
          >
            Resetta filtri
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredStanze.map((stanza) => {
            // Estraiamo la zona dai tag (es. [Zona, Tipo])
            const zone = stanza.tags?.[0] || 'Zona non specificata';
            
            return (
              <div key={stanza.id} className="bg-mbare-surface border-2 border-mbare-border p-5 flex flex-col hover:border-yellow-500 transition-colors group relative">
                
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-1 uppercase ${
                    stanza.type === 'OFFRO' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                  }`}>
                    {stanza.type === 'OFFRO' ? 'Offro' : 'Cerco'}
                  </span>
                  <span className="font-mono text-[10px] text-mbare-muted">
                    {new Date(stanza.createdAt || stanza.created_at).toLocaleDateString('it-IT')}
                  </span>
                </div>
                
                {/* Titolo e Zona */}
                <h3 className="text-lg font-display font-bold uppercase text-white group-hover:text-yellow-500 transition-colors leading-tight mb-2 line-clamp-2">
                  {stanza.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-yellow-500 border border-yellow-500 px-1.5 py-0.5">
                    📍 {zone}
                  </span>
                  {stanza.price && (
                    <span className="text-sm font-bold text-white">
                      €{Number(stanza.price).toFixed(0)}<span className="text-[10px] text-mbare-muted font-normal">/mese</span>
                    </span>
                  )}
                </div>

                {/* Descrizione */}
                <p className="text-mbare-muted font-sans text-sm line-clamp-3 mb-4 flex-grow">
                  {stanza.content}
                </p>

                {/* Footer Card */}
                <div className="mt-auto pt-3 border-t border-mbare-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 text-black flex items-center justify-center text-[10px] font-bold uppercase">
                      {stanza.author?.username?.charAt(0) || '?'}
                    </div>
                    <span className="font-mono text-[10px] text-mbare-muted uppercase truncate max-w-[100px]">
                      {stanza.author?.username || 'Studente'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleContact(stanza.author?.username || 'Studente')}
                    className="bg-mbare-white text-black px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-yellow-500 transition-colors whitespace-nowrap"
                  >
                    Contatta →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}