import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { BOARD_TYPES, getRealBoardType } from '../../config/boardConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function BoardCard({ post, onRefresh }: { post: any, onRefresh: () => void }) {
  const { user } = useUser();
  const [isSaved, setIsSaved] = useState(false); // In futuro prenderai questo dal DB
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

  const realType = getRealBoardType(post);
  const config = BOARD_TYPES[realType] || BOARD_TYPES['OFFRO'];
  const isAuthor = user?.id === (post.author_id || post.authorId);
  const authorName = post.author?.username || 'Anonimo';
  const dateStr = post.created_at || post.createdAt;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('it-IT') : '';

  // 1. Visualizza (incrementa views)
  const handleView = async () => {
    try {
      await fetch(`${API_URL}/board/${post.id}/view`, { method: 'POST' });
    } catch (err) { /* ignore */ }
  };

  // 2. Salva/Rimuovi dai preferiti
  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita che cliccando il cuore si apra il link
    if (!user) return alert('Loggati per salvare!');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/board/${post.id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (err) { console.error(err); }
  };

  // 3. Bump (Spingi in cima)
  const handleBump = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Vuoi spendere 20 Coin per spingere in cima questo annuncio?')) return;
    setIsBumping(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/board/${post.id}/bump`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      alert('Annuncio spinto in cima!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBumping(false);
    }
  };

  // 4. Elimina
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Vuoi eliminare questo annuncio?')) return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/board/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) onRefresh();
      else alert('Errore durante l\'eliminazione');
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      onClick={handleView}
      className="bg-mbare-surface border-2 border-mbare-border flex flex-col justify-between hover:border-mbare-white hover:shadow-[6px_6px_0_0_#ff3b00] transition-all group relative cursor-pointer overflow-hidden"
    >
      {/* IMMAGINE COPERTINA */}
      {post.images && post.images.length > 0 ? (
        <div className="w-full h-40 bg-mbare-black border-b-2 border-mbare-border relative overflow-hidden">
          <img 
            src={post.images[0]} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mbare-black via-transparent to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-2 bg-mbare-border"></div>
      )}

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-[10px] font-bold px-2 py-1 uppercase ${config.color}`}>
            {config.icon} {config.label}
          </span>
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-mbare-muted">{formattedDate}</span>
            <button onClick={handleSave} className="text-lg hover:scale-110 transition-transform">
              {isSaved ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <h3 className="text-lg font-display font-bold uppercase text-white mb-2 group-hover:text-mbare-accent transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-mbare-muted font-sans text-sm mb-4 line-clamp-3 flex-grow">
          {post.content}
        </p>

        {/* Tag e Città */}
        <div className="flex flex-wrap gap-1 mb-4">
          {post.city && (
            <span className="text-[9px] font-mono uppercase bg-mbare-accent text-black px-1.5 py-0.5 font-bold">
              📍 {post.city}
            </span>
          )}
          {post.tags && post.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-[9px] font-mono uppercase bg-mbare-black border border-mbare-border px-1.5 py-0.5 text-mbare-muted">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        {post.price && (
          <div className="mb-3">
            <span className="text-xl font-display font-bold text-white">
              €{Number(post.price).toFixed(2)}
              <span className="text-[10px] text-mbare-muted font-normal">{config.priceSuffix}</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-mbare-border pt-3 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-mbare-accent flex items-center justify-center text-[10px] font-bold text-black uppercase">
              {authorName.charAt(0)}
            </div>
            <span className="font-mono text-[10px] text-mbare-muted uppercase truncate max-w-[80px]">
              {authorName}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-mbare-muted text-[10px] font-mono">
            <span>👁️ {post.viewCount || 0}</span>
            {isAuthor && (
              <>
                <button onClick={handleBump} disabled={isBumping} className="text-mbare-accent font-bold hover:text-white" title="Spingi in cima (20 Coin)">
                  {isBumping ? '...' : '🚀'}
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="text-red-500 font-bold hover:text-white" title="Elimina">
                  {isDeleting ? '...' : '🗑️'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}