import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Carica gli eventi dal backend
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:3001/api/super-admin/events', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (err) {
      console.error('Errore caricamento eventi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 2. Azione: Approva evento
  const handleApprove = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/events/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchEvents(); // Ricarica la lista
    } catch (err) {
      alert('Errore durante l\'approvazione');
    }
  };

  // 3. Azione: Elimina evento
  const handleDelete = async (id: string) => {
    if (!confirm('Vuoi eliminare questo evento? Pensa ai partecipanti...')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchEvents(); // Ricarica la lista
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  if (loading) {
    return <p className="text-mbare-muted font-mono text-center py-12">Caricando gli eventi...</p>;
  }

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-6">
      <h3 className="font-display font-bold uppercase text-xl text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-mbare-accent rounded-full"></span>
        Gestione Eventi
      </h3>

      {events.length === 0 ? (
        <p className="text-mbare-muted font-mono">Nisciun eventu, manco un aperitivu!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="bg-mbare-black border border-mbare-border p-4 flex flex-col gap-2 hover:border-mbare-white transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-display font-bold text-white">
                    {event.title}
                  </h4>
                  <p className="text-mbare-muted font-sans text-sm mb-2">
                    {event.description || 'Nessuna descrizione.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mbare-muted font-mono">
                    <span>📍 {event.city}</span>
                    <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                    <span className="text-mbare-accent">
                      Creato da: {event.creator?.username || 'Anonimo'}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-mono uppercase px-2 py-1 ${
                  event.isApproved 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {event.isApproved ? 'APPROVATO' : 'IN ATTESA'}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-mbare-border">
                {!event.isApproved && (
                  <button 
                    onClick={() => handleApprove(event.id)} 
                    className="bg-green-500 text-black px-4 py-2 text-xs font-bold uppercase hover:bg-green-400 transition-colors"
                  >
                    Approva
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(event.id)} 
                  className="bg-red-500/10 text-red-500 border border-red-500 px-4 py-2 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}