import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function GroupsTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Funzione per caricare i gruppi dal backend
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:3001/api/super-admin/groups', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setGroups(await res.json());
      }
    } catch (err) {
      console.error('Errore caricamento gruppi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Azione: Elimina gruppo
  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Eliminare il gruppo? I membri rimarranno a piedi!')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchGroups(); // Ricarica la lista
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  if (loading) {
    return <p className="text-mbare-muted font-mono text-center py-12">Caricando i gruppi...</p>;
  }

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-6">
      <h3 className="font-display font-bold uppercase text-xl text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-mbare-accent rounded-full"></span>
        Gruppi di Studio
      </h3>

      {groups.length === 0 ? (
        <p className="text-mbare-muted font-mono">Nisciun gruppu, studiati sulu!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="bg-mbare-black border border-mbare-border p-4 flex flex-col justify-between hover:border-mbare-accent transition-colors group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-display font-bold text-white group-hover:text-mbare-accent transition-colors">
                    {group.name}
                  </h4>
                  <span className="text-xs font-mono text-black bg-mbare-accent px-2 py-0.5 uppercase font-bold">
                    {group.category}
                  </span>
                </div>
                
                <p className="text-mbare-muted font-sans text-sm mb-4 line-clamp-2">
                  {group.description || 'Nessuna descrizione.'}
                </p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mbare-muted font-mono mb-4">
                  <span>📍 {group.city}</span>
                  <span>👥 {group._count?.members || 0}/{group.maxMembers} membri</span>
                  <span className="text-mbare-accent">
                    Creato da: {group.creator?.username || 'Anonimo'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteGroup(group.id)} 
                className="bg-red-500/10 text-red-500 border border-red-500 px-3 py-2 text-xs uppercase font-bold hover:bg-red-500 hover:text-white transition-colors self-start mt-2 w-full md:w-auto"
              >
                Elimina Gruppo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}