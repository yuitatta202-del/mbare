import { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { RipetizioniForm } from '../../components/student-hub/RipetizioniForm';
import { RipetizioniCard } from '../../components/student-hub/RipetizioniCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function Ripetizioni() {
  const { user } = useUser();
  
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'TUTTI' | 'OFFRO' | 'CERCO'>('TUTTI');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (res.ok) {
        const data = await res.json();
        // Filtriamo solo gli annunci di categoria 'STUDIO'
        setAds(data.filter((ad: any) => ad.category === 'STUDIO'));
      }
    } catch (err) {
      console.error('Errore caricamento annunci:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Logica di filtro e ricerca combinata
  const filteredAds = ads.filter(ad => {
    const matchesType = filterType === 'TUTTI' || ad.type === filterType;
    const searchString = `${ad.title} ${ad.content} ${ad.tags?.join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      
      {/* Header della sezione */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-mbare-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter leading-none">
            Ripetizioni<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">
            Impara o insegna. Connettiti con altri studenti, senza intermediari.
          </p>
        </div>
        
        <button 
          onClick={() => user ? setShowForm(!showForm) : alert('Devi essere loggato!')}
          className="bg-mbare-accent text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-colors border-2 border-mbare-accent hover:border-white whitespace-nowrap shadow-[4px_4px_0_0_#fff]"
        >
          {showForm ? 'Annulla' : '+ Pubblica Annuncio'}
        </button>
      </div>

      {/* Form di Pubblicazione (Nascosto di default) */}
      {showForm && (
        <RipetizioniForm 
          onSuccess={() => { 
            setShowForm(false); 
            fetchAds(); 
          }} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {/* Filtri e Ricerca */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex gap-2 font-mono text-xs uppercase shrink-0">
          <button 
            onClick={() => setFilterType('TUTTI')} 
            className={`px-4 py-2 border-2 transition-colors ${filterType === 'TUTTI' ? 'bg-mbare-white text-black border-mbare-white font-bold' : 'text-mbare-muted border-mbare-border hover:border-mbare-white'}`}
          >
            Tutti
          </button>
          <button 
            onClick={() => setFilterType('OFFRO')} 
            className={`px-4 py-2 border-2 transition-colors ${filterType === 'OFFRO' ? 'bg-green-500 text-black border-green-500 font-bold' : 'text-mbare-muted border-mbare-border hover:border-green-500'}`}
          >
            Offro
          </button>
          <button 
            onClick={() => setFilterType('CERCO')} 
            className={`px-4 py-2 border-2 transition-colors ${filterType === 'CERCO' ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'text-mbare-muted border-mbare-border hover:border-blue-500'}`}
          >
            Cerco
          </button>
        </div>
        
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Cerca materia, facoltà o parola chiave..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-mbare-surface border-2 border-mbare-border text-white p-2 px-4 focus:border-mbare-accent outline-none font-sans text-sm h-full"
          />
        </div>
      </div>

      {/* Lista Annunci */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-mbare-muted font-mono animate-pulse uppercase tracking-widest">Caricando gli annunci...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-20 bg-mbare-surface border-2 border-mbare-border border-dashed flex flex-col items-center justify-center">
          <span className="text-4xl mb-4">🕵️‍♂️</span>
          <h2 className="text-2xl font-display font-bold text-mbare-muted uppercase mb-2">Nessun annuncio trovato</h2>
          <p className="text-mbare-border font-sans max-w-md">Prova a cambiare i filtri di ricerca o pubblica tu il primo annuncio per questa materia!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <RipetizioniCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}

    </div>
  );
}