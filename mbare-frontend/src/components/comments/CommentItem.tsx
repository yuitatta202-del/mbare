import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function CommentItem({ comment, onReply, onRefresh }: { comment: any, onReply: (c: any) => void, onRefresh: () => void }) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm('Vuoi eliminare questo commento?')) return;
    
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Errore durante l\'eliminazione.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-mbare-surface border border-mbare-border p-3 relative group">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] uppercase font-bold ${comment.isOp ? 'text-mbare-accent' : 'text-mbare-muted'}`}>
              {comment.displayName}
            </span>
            {comment.isOp && (
              <span className="bg-mbare-accent text-black text-[8px] font-bold px-1 rounded-sm uppercase" title="Autore Originale">OP</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-mbare-muted">
              {new Date(comment.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            {user && (user.id === comment.authorId || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes((user as any).user_role)) && (
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="text-[9px] text-mbare-muted hover:text-red-500 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Elimina
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-mbare-white font-sans">{comment.content}</p>
        
        <button 
          onClick={() => onReply(comment)}
          className="mt-2 text-[9px] font-mono uppercase text-mbare-muted hover:text-mbare-accent transition-colors"
        >
          Rispondi
        </button>
      </div>

      {/* Risposte */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2 pl-3 border-l border-mbare-border flex flex-col gap-2">
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="bg-mbare-black border border-mbare-border/50 p-2 relative group">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] uppercase font-bold ${reply.isOp ? 'text-mbare-accent' : 'text-mbare-muted'}`}>
                    {reply.displayName}
                  </span>
                  {reply.isOp && (
                    <span className="bg-mbare-accent text-black text-[7px] font-bold px-1 rounded-sm uppercase">OP</span>
                  )}
                </div>
                <span className="text-[8px] font-mono text-mbare-muted">
                  {new Date(reply.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-mbare-white font-sans">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}