import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Configurazione colori per tipo annuncio
const TYPE_COLORS: Record<string, string> = {
  CERCO: 'bg-blue-500',
  OFFRO: 'bg-green-500',
  VENDO: 'bg-pink-500',
  REGALO: 'bg-yellow-500',
};

export function BoardTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('TUTTI');

  // 1. Carica gli annunci dal backend
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:3001/api/super-admin/board', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error('Errore caricamento annunci:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Azione: Elimina annuncio
  const handleDelete = async (id: string) => {
    if (!confirm('Vuoi eliminare questo annuncio? Il proprietario si arrabbierà...')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/board/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchPosts();
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  // 3. Filtraggio locale (per non stressare il backend)
  const filteredPosts = posts.filter(post => {
    const matchesType = filterType === 'TUTTI' || post.type === filterType;
    const matchesSearch = searchQuery === '' || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return <p className="text-mbare-muted font-mono text-center py-12">Caricando gli annunci...</p>;
  }

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="font-display font-bold uppercase text-xl text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-mbare-accent rounded-full"></span>
          Bacheca Annunci ({posts.length})
        </h3>

        {/* Ricerca */}
        <input
          type="text"
          placeholder="Cerca per titolo, contenuto o autore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 bg-mbare-black border border-mbare-border text-white px-3 py-2 font-mono text-sm focus:border-mbare-accent outline-none"
        />
      </div>

      {/* Filtri per tipo */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['TUTTI', 'CERCO', 'OFFRO', 'VENDO', 'REGALO'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 font-mono text-xs uppercase border-2 transition-all ${
              filterType === type
                ? 'bg-mbare-accent text-black border-mbare-accent font-bold'
                : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Lista Annunci */}
      {filteredPosts.length === 0 ? (
        <p className="text-mbare-muted font-mono text-center py-8">
          {posts.length === 0 
            ? 'Nuddu annunciu, picciotti!' 
            : 'Nessun annuncio trovato con questi filtri.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-mbare-black border border-mbare-border p-4 flex flex-col justify-between hover:border-mbare-accent transition-colors group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-mono text-black px-2 py-0.5 uppercase font-bold ${TYPE_COLORS[post.type] || 'bg-gray-500'}`}>
                    {post.type}
                  </span>
                  <span className="text-xs font-mono text-mbare-muted">
                    {new Date(post.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>

                <h4 className="text-lg font-display font-bold text-white group-hover:text-mbare-accent transition-colors mb-1">
                  {post.title}
                </h4>
                
                <p className="text-mbare-muted font-sans text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>

                {/* Categoria e Prezzo */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono mb-3">
                  <span className="text-mbare-muted">🏷️ {post.category}</span>
                  {post.price && (
                    <span className="text-mbare-accent font-bold">€{post.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-mono bg-mbare-surface border border-mbare-border px-1.5 py-0.5 text-mbare-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Autore */}
                <p className="text-xs text-mbare-accent font-mono">
                  Pubblicato da: <span className="text-white font-bold">{post.author?.username || 'Anonimo'}</span>
                  {post.author?.role && ` (${post.author.role})`}
                </p>
              </div>

              <button
                onClick={() => handleDelete(post.id)}
                className="bg-red-500/10 text-red-500 border border-red-500 px-4 py-2 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors mt-4 w-full"
              >
                Elimina Annuncio
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}