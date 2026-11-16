import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { HUB_SERVICES } from '../../config/studentHubServices';
import { HubServiceCard } from '../../components/student-hub/HubServiceCard';
import { Link } from 'react-router-dom';

export function StudentHubDashboard() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('TUTTI');

  const categories = ['TUTTI', ...Array.from(new Set(HUB_SERVICES.map(s => s.category)))];

  const filteredServices = HUB_SERVICES.filter(service => {
    const matchesCategory = activeCategory === 'TUTTI' || service.category === activeCategory;
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      service.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* HEADER ARANCIONE */}
      <div className="bg-mbare-accent text-black p-6 md:p-8 border-2 border-mbare-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <span className="font-mono text-xs uppercase tracking-widest mb-1 block opacity-70">
            Benvenuto, {user?.email?.split('@')[0] || 'Studente'}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter leading-none">
            Di cosa hai bisogno oggi?
          </h1>
          <p className="font-sans text-sm md:text-base mt-2 opacity-80">
            Cerca un servizio, filtra per categoria o esplora le nostre chicche.
          </p>
        </div>
        <div className="relative z-10 bg-black text-white border-2 border-black px-4 py-3 flex flex-col items-center shrink-0">
          <span className="font-mono text-[10px] text-mbare-muted uppercase tracking-widest">Il tuo status</span>
          <span className="font-display font-bold uppercase text-mbare-accent text-base">Studente Attivo</span>
        </div>
      </div>

      {/* BARRA DI RICERCA */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mbare-muted group-focus-within:text-mbare-accent transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input 
          type="text"
          placeholder="Cerca cosa ti serve... (es. 'stanze', 'appunti')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-mbare-surface border-2 border-mbare-border text-white pl-14 pr-4 py-4 focus:border-mbare-accent outline-none font-sans text-lg placeholder:text-mbare-muted transition-all shadow-[4px_4px_0_0_#222] focus:shadow-[4px_4px_0_0_#ff3b00]"
        />
      </div>

      {/* FILTRI CATEGORIE */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 font-mono text-xs uppercase border-2 transition-all ${
              activeCategory === cat
                ? 'bg-mbare-white text-black border-mbare-white font-bold shadow-[2px_2px_0_0_#ff3b00]'
                : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CONTEGGIO */}
      <div className="flex items-center justify-between border-b-2 border-mbare-border pb-2">
        <h2 className="font-display font-bold uppercase text-xl md:text-2xl text-white">
          {activeCategory === 'TUTTI' ? 'Tutti i Servizi' : activeCategory}
        </h2>
        <span className="font-mono text-xs text-mbare-muted uppercase">
          {filteredServices.length} risultati
        </span>
      </div>

      {/* GRIGLIA */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 border-2 border-mbare-border border-dashed flex flex-col items-center">
          <span className="text-5xl mb-4 opacity-50">🔎</span>
          <p className="text-mbare-muted font-mono text-lg uppercase">Nessun servizio trovato per "{searchQuery}"</p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('TUTTI'); }}
            className="mt-6 bg-mbare-white text-black px-6 py-2 font-bold uppercase text-sm hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent"
          >
            Resetta filtri
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <HubServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* CTA ARCADE */}
      <div className="mt-4 bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col md:flex-row justify-between items-center gap-4 group hover:border-mbare-accent transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-mbare-accent text-black flex items-center justify-center text-3xl shrink-0">
            🎮
          </div>
          <div>
            <h3 className="font-display font-bold uppercase text-white text-lg">Hai bisogno di Mbare Coin?</h3>
            <p className="text-mbare-muted font-sans text-sm">Vai all'Arcade, sfida i tuoi amici e guadagna token da spendere qui.</p>
          </div>
        </div>
        <Link 
          to="/arcade"
          className="bg-mbare-white text-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-colors whitespace-nowrap"
        >
          Vai all'Arcade →
        </Link>
      </div>

    </div>
  );
}