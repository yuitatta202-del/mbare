import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // <-- Importiamo supabase

// Tipi di evento e colori
const CATEGORIES = {
  ALL: { label: 'Tutte', color: 'bg-mbare-white' },
  SERATA: { label: 'Serate', color: 'bg-pink-500' },
  APERITIVO: { label: 'Aperitivi', color: 'bg-orange-500' },
  SPORT: { label: 'Sport', color: 'bg-green-500' },
  CULTURA: { label: 'Cultura', color: 'bg-blue-500' },
  VIAGGIO: { label: 'Viaggi', color: 'bg-purple-500' },
  ALTRO: { label: 'Altro', color: 'bg-gray-500' },
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=1000&auto=format&fit=crop";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) { clearInterval(interval); setTimeLeft({ days: 0, hours: 0, minutes: 0 }); }
      else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2 font-mono text-xs text-white">
      <div className="bg-mbare-black/50 px-2 py-1 rounded">{timeLeft.days}g</div>
      <div className="bg-mbare-black/50 px-2 py-1 rounded">{timeLeft.hours}o</div>
      <div className="bg-mbare-black/50 px-2 py-1 rounded">{timeLeft.minutes}m</div>
    </div>
  );
}

export function Community() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [events, setEvents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Caricamento dati (Eventi + Gruppi)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvents, resGroups] = await Promise.all([
          fetch('http://localhost:3001/api/events'),
          fetch('http://localhost:3001/api/groups')
        ]);

        if (resEvents.ok) setEvents(await resEvents.json());
        if (resGroups.ok) setGroups(await resGroups.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtraggio Eventi
  const filteredEvents = events.filter(event => {
    const matchesCategory = activeFilter === 'ALL' || event.category === activeFilter;
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredEvent = filteredEvents[0];
  const otherEvents = filteredEvents.slice(1);

  const getCategoryColor = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES]?.color || 'bg-gray-500';
  };

  // Funzione per unirsi a un gruppo
  const joinGroup = async (groupId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Devi essere loggato per unirti a un gruppo");

    const res = await fetch(`http://localhost:3001/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });

    if (res.ok) {
      alert("Ti sei unito al gruppo!");
    } else {
      alert("Errore durante l'iscrizione al gruppo.");
    }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-mbare-muted font-mono">Caricamento...</div>;
  if (error) return <div className="min-h-screen pt-32 text-center text-mbare-accent font-mono">Errore: {error}</div>;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Intestazione con Bottoni */}
        <div className="mb-8 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none">
              La Mbare<span className="text-mbare-accent">.</span> Fam
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4 max-w-2xl">
              Non sei qui per guardare. Sei qui per fare. Scopri cosa bolle in pentola o crea il tuo evento.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link to="/community/create-group" className="bg-transparent text-mbare-white px-6 py-3 font-bold uppercase tracking-tighter hover:border-mbare-white transition-colors border-2 border-mbare-border whitespace-nowrap text-center">
              + Crea Gruppo
            </Link>
            <Link to="/community/create" className="bg-mbare-white text-mbare-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent whitespace-nowrap text-center">
              + Crea Evento
            </Link>
          </div>
        </div>

        {/* Barra Ricerca e Filtri */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Cerca eventi, città..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-mbare-surface border-2 border-mbare-border text-mbare-white px-4 py-3 pl-10 font-mono text-sm focus:border-mbare-accent outline-none transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3.5 text-mbare-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-2/3">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${
                  activeFilter === key 
                    ? `${value.color} text-black border-transparent font-bold` 
                    : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-mbare-white'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>

        {/* Griglia Principale */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Colonna Sinistra: Eventi */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {filteredEvents.length === 0 && (
              <div className="bg-mbare-surface border-2 border-mbare-border p-12 text-center">
                <p className="text-mbare-muted font-mono text-lg uppercase">Nessun evento trovato.</p>
                <p className="text-mbare-border font-sans mt-2">Prova a cambiare ricerca o filtro.</p>
              </div>
            )}

            {featuredEvent && (
              <div className="group relative h-[400px] overflow-hidden border-2 border-mbare-border hover:border-mbare-white transition-colors cursor-pointer bg-mbare-surface">
                <img src={featuredEvent.imageUrl || DEFAULT_IMAGE} alt={featuredEvent.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-mbare-black via-mbare-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`${getCategoryColor(featuredEvent.category)} text-black font-bold text-xs px-2 py-1 uppercase`}>
                        {CATEGORIES[featuredEvent.category as keyof typeof CATEGORIES].label}
                      </span>
                      <Countdown targetDate={featuredEvent.eventDate} />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold uppercase leading-none mb-2 text-white">{featuredEvent.title}</h2>
                    <p className="text-mbare-muted font-sans text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {featuredEvent.city}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-mbare-white text-mbare-black flex items-center justify-center rounded-full group-hover:bg-mbare-accent group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherEvents.map((event) => (
                <div key={event.id} className="group bg-mbare-surface border-2 border-mbare-border hover:border-mbare-accent transition-all cursor-pointer relative overflow-hidden flex flex-col">
                  <div className="h-40 overflow-hidden relative">
                    <img src={event.imageUrl || DEFAULT_IMAGE} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute top-2 left-2">
                      <span className={`${getCategoryColor(event.category)} text-black font-bold text-xs px-2 py-1 uppercase`}>
                        {CATEGORIES[event.category as keyof typeof CATEGORIES].label}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase leading-tight mb-2 group-hover:text-mbare-accent transition-colors">{event.title}</h3>
                      <p className="text-mbare-muted font-sans text-xs mb-4">{event.city}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-mbare-border pt-4">
                      <Countdown targetDate={event.eventDate} />
                      <span className="font-mono text-xs text-mbare-accent uppercase">Dettagli →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SEZIONE GRUPPI DI STUDIO */}
            <div className="mt-12">
              <h2 className="text-4xl font-display font-bold uppercase tracking-tighter mb-6">
                Gruppi<span className="text-mbare-accent">.</span> di Studio
              </h2>
              
              {groups.length === 0 ? (
                <div className="bg-mbare-surface border-2 border-mbare-border p-8 text-center">
                  <p className="text-mbare-muted font-mono">Nessun gruppo creato. Sii il primo!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groups.map((group) => (
                    <div key={group.id} className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col justify-between hover:border-mbare-accent transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-xs font-bold px-2 py-1 uppercase text-black bg-mbare-white`}>
                            {group.category}
                          </span>
                          <span className="font-mono text-xs text-mbare-muted">{group.city}</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">{group.name}</h3>
                        <p className="text-mbare-muted font-sans text-sm mb-4">{group.description}</p>
                        <p className="text-mbare-muted font-mono text-xs mb-4">
                          Max {group.maxMembers} membri • Creato da {group.creator?.username || 'Anonimo'}
                        </p>
                      </div>
                      <button 
                        onClick={() => joinGroup(group.id)}
                        className="w-full bg-mbare-white text-mbare-black py-3 text-sm font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all"
                      >
                        Unisciti al Gruppo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

{/* Colonna Destra */}
<div className="md:col-span-4 flex flex-col gap-6">
  <div className="bg-mbare-surface border-2 border-mbare-border p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-mbare-accent/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
    <h3 className="text-2xl font-display font-bold uppercase leading-none mb-2 relative z-10">Chi c'è<br/>ora?</h3>
    <p className="text-mbare-muted font-sans text-sm mb-6 relative z-10">99 studenti online in questo momento. Entra nella chat e presentati.</p>
    <div className="flex -space-x-4 mb-6 relative z-10">
      <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-mbare-surface"></div>
      <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-mbare-surface"></div>
      <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-mbare-surface"></div>
      <div className="w-10 h-10 rounded-full bg-mbare-accent text-mbare-black flex items-center justify-center font-bold text-xs border-2 border-mbare-surface z-10">+96</div>
    </div>
    {/* BOTTONE AGGIORNATO CON LINK */}
    <Link 
      to="/chat" 
      className="w-full bg-mbare-black border border-mbare-border py-3 text-sm font-bold uppercase hover:border-mbare-accent hover:text-mbare-accent transition-colors relative z-10 text-center block"
    >
      Entra nella Chat
    </Link>
  </div>

  <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-display font-bold uppercase text-mbare-white mb-2">Bacheca Volante</h3>
      <p className="text-mbare-muted font-sans text-sm mb-6">Cerchi casa? Vendi un biglietto? Hai bisogno di aiuto?</p>
    </div>
    <Link to="/community/bacheca" className="w-full bg-mbare-white text-mbare-black py-3 text-center text-sm font-bold uppercase hover:bg-mbare-accent hover:text-white transition-all">Vai agli Annunci</Link>
  </div>

  <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col justify-between border-dashed border-mbare-muted/50">
    <div>
      <h3 className="text-xl font-display font-bold uppercase text-mbare-white mb-2">Trova il tuo Gang</h3>
      <p className="text-mbare-muted font-sans text-sm mb-4">Filtra per interessi e trova studenti che fanno per te.</p>
    </div>
    <Link to="/match" className="text-mbare-accent font-mono text-xs uppercase hover:text-white transition-colors">Inizia il Matchmaking →</Link>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}