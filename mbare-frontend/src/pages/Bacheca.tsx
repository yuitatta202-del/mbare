import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { BoardCard } from '../components/bacheca/BoardCard';
import { BOARD_TYPES } from '../config/boardConfig';

// Usa la variabile d'ambiente, fallback su localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORIES = ['TUTTI', 'STANZE', 'BIGLIETTI', 'LIBRI', 'OGGETTI', 'STUDIO', 'PASSAGGI', 'ALTRO'];
const BASE_TYPES = ['OFFRO', 'CERCO', 'VENDO', 'REGALO'];

export function Bacheca() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [activeFilter, setActiveFilter] = useState('TUTTI');
  const [activeType, setActiveType] = useState('TUTTI');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // <-- Aggiunto stato errore
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newPost, setNewPost] = useState({ 
    title: '', content: '', category: 'STANZE', type: 'OFFRO', tags: '', price: '', city: '', imageUrl: '' 
  });

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/board`);
      if (!res.ok) throw new Error(`Errore server: ${res.status}`);
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      console.error("Errore caricamento bacheca:", err);
      setError("Impossibile caricare gli annunci. Controlla che il backend sia acceso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel('board-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'board_posts' }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeFilter === 'TUTTI' || p.category === activeFilter;
    const realType = p.tags?.includes('DISPENSA') ? 'DISPENSA' : p.category === 'STANZE' ? 'STANZE' : p.type;
    const matchesType = activeType === 'TUTTI' || realType === activeType || p.type === activeType;
    return matchesCategory && matchesType;
  });

  const handlePublishClick = () => {
    if (!user) {
      alert('Minchia, ma unni vai? Prima ti devi accàttari per pubblicare un annuncio!');
      navigate('/login');
    } else {
      setShowCreateForm(!showCreateForm);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const parsedPrice = newPost.price ? parseFloat(newPost.price) : null;
      
      const res = await fetch(`${API_URL}/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
          price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore creazione annuncio');
      }
      
      setShowCreateForm(false);
      setNewPost({ title: '', content: '', category: 'STANZE', type: 'OFFRO', tags: '', price: '', city: '', imageUrl: '' });
      fetchPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-mbare-border pb-8">
          <div>
            <Link to="/community" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-4 block">
              ← Torna alla Community
            </Link>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              Bacheca<span className="text-mbare-accent">.</span>
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4">
              Tutto quello che ti serve, e quello che non sapevi di volere.
            </p>
          </div>
          
          <button 
            onClick={handlePublishClick}
            className="bg-mbare-accent text-white px-6 py-3 font-bold uppercase tracking-tighter hover:bg-white hover:text-mbare-accent transition-colors border-2 border-mbare-accent hover:border-white whitespace-nowrap shadow-[4px_4px_0_0_#fff]"
          >
            {showCreateForm ? 'Annulla' : '+ Pubblica'}
          </button>
        </div>

        {/* Banner di Errore */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-red-400 font-mono text-sm uppercase">{error}</p>
            <button 
              onClick={fetchPosts}
              className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-600 transition-colors"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Form Creazione */}
        {showCreateForm && user && (
          <form onSubmit={handleCreate} className="bg-mbare-surface border-2 border-mbare-border p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <div className="col-span-full flex justify-between items-center border-b border-mbare-border pb-2 mb-2">
              <h3 className="font-display font-bold uppercase text-xl text-white">Nuovo Annuncio</h3>
            </div>
            
            <input type="text" placeholder="Titolo" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 col-span-full focus:border-mbare-accent outline-none" required maxLength={100}/>
            <textarea placeholder="Descrizione dettagliata..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 h-24 col-span-full focus:border-mbare-accent outline-none" required />
            
            <select value={newPost.category} onChange={(e) => setNewPost({...newPost, category: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none">
              {CATEGORIES.filter(c => c !== 'TUTTI').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select value={newPost.type} onChange={(e) => setNewPost({...newPost, type: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none">
              {BASE_TYPES.map(t => <option key={t} value={t}>{BOARD_TYPES[t].label}</option>)}
            </select>

            <input type="text" placeholder="Città (es. Catania)" value={newPost.city} onChange={(e) => setNewPost({...newPost, city: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none" />
            <input type="text" placeholder="Tag (separati da virgola)" value={newPost.tags} onChange={(e) => setNewPost({...newPost, tags: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none" />
            <input type="number" step="0.01" min="0" placeholder="Prezzo (€) - opzionale" value={newPost.price} onChange={(e) => setNewPost({...newPost, price: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none" />
            <input type="url" placeholder="Link Immagine (opzionale)" value={newPost.imageUrl} onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})} className="bg-mbare-black border border-mbare-border text-white p-2 focus:border-mbare-accent outline-none" />

            <button type="submit" disabled={isSubmitting} className="bg-mbare-white text-black font-bold uppercase py-2 hover:bg-mbare-accent hover:text-white transition-colors disabled:opacity-50 col-span-full md:col-span-1">
              {isSubmitting ? 'Pubblicazione...' : 'Pubblica'}
            </button>
          </form>
        )}

        {/* Filtri Categorie */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${activeFilter === filter ? 'bg-mbare-white text-black border-mbare-white font-bold' : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Filtri Tipo */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button onClick={() => setActiveType('TUTTI')} className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${activeType === 'TUTTI' ? 'bg-mbare-white text-black border-mbare-white font-bold' : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white'}`}>TUTTI</button>
          {Object.entries(BOARD_TYPES).map(([key, config]) => (
            <button key={key} onClick={() => setActiveType(key)} className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${activeType === key ? `${config.color} border-transparent font-bold shadow-[2px_2px_0_0_#fff]` : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white'}`}>
              {config.icon} {config.label}
            </button>
          ))}
        </div>

        {/* Lista Annunci */}
        {loading ? (
          <p className="text-mbare-muted font-mono text-center py-12 animate-pulse">Caricamento annunci...</p>
        ) : filteredPosts.length === 0 && !error ? (
          <div className="bg-mbare-surface border-2 border-mbare-border p-12 text-center">
            <p className="text-mbare-muted font-mono text-lg uppercase">Nessun annuncio trovato.</p>
            <p className="text-mbare-border font-sans mt-2">Prova a cambiare filtro o pubblica il tuo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <BoardCard key={post.id} post={post} onRefresh={fetchPosts} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}