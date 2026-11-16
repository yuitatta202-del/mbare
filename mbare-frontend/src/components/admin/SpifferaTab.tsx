import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CATEGORY_COLORS: Record<string, string> = {
  SPICY: 'bg-red-500',
  CRINGE: 'bg-gray-500',
  UNI: 'bg-blue-500',
  DRAMA: 'bg-purple-500',
  UNPOPULAR: 'bg-yellow-500',
};

export function SpifferaTab() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [spifferaList, setSpifferaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpiffera = async (tab: 'pending' | 'history') => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Se siamo in history, chiediamo al backend di darci le approvate/rifiutate.
      // Se siamo in pending, chiediamo solo quelle in attesa.
      const endpoint = tab === 'pending' 
        ? `${API_URL}/super-admin/confessions/pending` 
        : `${API_URL}/super-admin/confessions/history`;
        
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (res.ok) {
        setSpifferaList(await res.json());
      }
    } catch (err) {
      console.error('Errore caricamento spiffera:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpiffera(activeTab);
  }, [activeTab]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${API_URL}/super-admin/confessions/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      // Ricarica la lista corrente (l'elemento sparirà dalla lista pending)
      fetchSpiffera(activeTab); 
    } catch (err) {
      alert(`Errore durante l'azione: ${action}`);
    }
  };

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col h-[700px]">
      
      {/* Header con Tabs */}
      <div className="flex justify-between items-center border-b border-mbare-border pb-4 mb-4">
        <h3 className="font-display font-bold uppercase text-xl text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-mbare-accent rounded-full animate-pulse"></span>
          Gestione Spiffera
        </h3>
        
        <div className="flex gap-2 font-mono text-xs uppercase">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 border-2 transition-colors ${activeTab === 'pending' ? 'bg-mbare-accent text-black border-mbare-accent font-bold' : 'text-mbare-muted border-mbare-border hover:border-mbare-white'}`}
          >
            In Attesa
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 border-2 transition-colors ${activeTab === 'history' ? 'bg-mbare-white text-black border-mbare-white font-bold' : 'text-mbare-muted border-mbare-border hover:border-mbare-white'}`}
          >
            Storico
          </button>
        </div>
      </div>

      {/* Lista Scrollabile */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <p className="text-mbare-muted font-mono text-center py-12 animate-pulse">Caricando il tea...</p>
        ) : spifferaList.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center opacity-50">
            <p className="text-mbare-muted font-mono text-lg">Nisciuna spifferata qui.</p>
            <p className="text-mbare-border font-sans mt-2">Torna quando ci sarà nuovo drama.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {spifferaList.map((spiffera) => (
              <div 
                key={spiffera.id} 
                className="bg-mbare-black border border-mbare-border p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 uppercase text-black ${CATEGORY_COLORS[spiffera.category] || 'bg-gray-500'}`}>
                      {spiffera.category}
                    </span>
                    {activeTab === 'history' && (
                      <span className={`text-[10px] font-bold px-2 py-1 uppercase text-black ${spiffera.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {spiffera.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-mbare-muted">
                    {new Date(spiffera.createdAt || spiffera.created_at).toLocaleString('it-IT')}
                  </span>
                </div>

                <p className="text-mbare-white font-sans text-lg">
                  "{spiffera.content}"
                </p>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-mbare-border">
                  <div className="flex items-center gap-2">
                    <span className="text-mbare-accent text-lg">🌶️</span>
                    <span className="font-mono text-sm text-mbare-accent font-bold">
                      {spiffera.spicyLevel || spiffera.score || 50}% Spicy
                    </span>
                  </div>
                  
                  {/* Mostra i bottoni solo se siamo in 'pending' */}
                  {activeTab === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(spiffera.id, 'approve')} 
                        className="bg-green-500 text-black px-4 py-2 text-xs font-bold uppercase hover:bg-green-400 transition-colors"
                      >
                        Approva
                      </button>
                      <button 
                        onClick={() => handleAction(spiffera.id, 'reject')} 
                        className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-400 transition-colors"
                      >
                        Rifiuta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}