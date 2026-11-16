import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SpifferaForm } from '../components/spiffera/SpifferaForm';
import { SpifferaCard } from '../components/spiffera/SpifferaCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function Spiffera() {
  // Stati per il Feed
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Funzione per caricare il feed
  const fetchConfessions = async () => {
    try {
      const res = await fetch(`${API_URL}/confessions`);
      if (res.ok) setConfessions(await res.json());
    } catch (err) {
      console.error('Errore caricamento spiffere:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchConfessions();

    // Sottoscrizione Realtime: quando un admin approva, elimina o un utente vota, il feed si aggiorna
    const channel = supabase
      .channel('spiffera-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spiffera' }, 
        () => fetchConfessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-7xl">
        
        {/* Intestazione */}
        <div className="mb-12 border-b-2 border-mbare-border pb-8">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-4">
            Spiffera<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-xl max-w-2xl">
            Gossip, drama e verità scomode. Leggi cosa bolle in pentola o lancia il tuo pettegolezzo in totale anonimato.
          </p>
        </div>

        {/* Layout a 2 colonne */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLONNA SINISTRA: IL FEED */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="font-display font-bold text-2xl uppercase border-b-2 border-mbare-border pb-2">
              Il Muro del Drama
            </h2>
            
            {loadingFeed ? (
              // Skeleton Loader
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-mbare-surface border-2 border-mbare-border p-6 animate-pulse h-40">
                    <div className="flex justify-between mb-4">
                      <div className="w-20 h-6 bg-mbare-border"></div>
                      <div className="w-16 h-4 bg-mbare-border"></div>
                    </div>
                    <div className="w-full h-4 bg-mbare-border mb-2"></div>
                    <div className="w-3/4 h-4 bg-mbare-border"></div>
                  </div>
                ))}
              </div>
            ) : confessions.length === 0 ? (
              <div className="bg-mbare-surface border-2 border-mbare-border p-12 text-center">
                <p className="text-mbare-muted font-mono text-lg">Nisciuna spifferata.</p>
                <p className="text-mbare-border font-sans mt-2">Sii il primo a rompere il silenzio!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                {confessions.map((conf) => (
                  <SpifferaCard 
                    key={conf.id} 
                    conf={conf} 
                    onRefresh={fetchConfessions} // Passiamo la funzione per aggiornare la media
                  />
                ))}
              </div>
            )}
          </div>

          {/* COLONNA DESTRA: IL FORM */}
          <div className="lg:col-span-5">
            <SpifferaForm onSuccess={fetchConfessions} />
          </div>

        </div>
      </div>
    </div>
  );
}