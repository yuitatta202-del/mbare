import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { Link } from 'react-router-dom';

export function StudentHub() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Array di tutti i servizi disponibili
  const services = [
    // --- STUDIO ---
    { 
      id: 'dispense', 
      title: 'Dispense & Appunti', 
      desc: 'Sbircia gli appunti degli altri o carica i tuoi. Salva la sessione.', 
      icon: '📚', 
      category: 'Studio',
      link: '/student-hub/dispense',
      color: 'bg-blue-500'
    },
    { 
      id: 'esami', 
      title: 'Prove d\'Esame', 
      desc: 'Raccolta delle tracce passate per non farti trovare impreparato.', 
      icon: '📝', 
      category: 'Studio',
      link: '/student-hub/esami',
      color: 'bg-red-500'
    },
    { 
      id: 'ripetizioni', 
      title: 'Ripetizioni & Tutor', 
      desc: 'Trova un tutor per passare quel esame maledetto o offri ripetizioni.', 
      icon: '🧑‍🏫', 
      category: 'Studio',
      link: '/student-hub/ripetizioni',
      color: 'bg-green-500'
    },

    // --- CASA & VITA ---
    { 
      id: 'stanze', 
      title: 'Cerco/Offro Stanze', 
      desc: 'Stanze singole, doppie o posti letto. Niente truffe, solo roba vera.', 
      icon: '🏠', 
      category: 'Vita Quotidiana',
      link: '/community/bacheca', // Rimanda alla bacheca
      color: 'bg-yellow-500'
    },
    { 
      id: 'coinquilini', 
      title: 'Match Coinquilini', 
      desc: 'Trova qualcuno con cui convivere senza rischiare di ammazzarvi.', 
      icon: '🤝', 
      category: 'Vita Quotidiana',
      link: '/profile', // Dovrebbe rimandare al form cerca_coinquilino
      color: 'bg-purple-500'
    },
    { 
      id: 'passaggi', 
      title: 'Passaggi & Carpooling', 
      desc: 'Torni a casa per il weekend? Offri o cerca un passaggio.', 
      icon: '🚗', 
      category: 'Vita Quotidiana',
      link: '/community/bacheca',
      color: 'bg-indigo-500'
    },
    { 
      id: 'convenzioni', 
      title: 'Sconti & Convenzioni', 
      desc: 'Bar, palestre, pizzerie. Mostra l\'app e paga meno. (In arrivo)', 
      icon: '🏷️', 
      category: 'Vita Quotidiana',
      link: '#',
      color: 'bg-pink-500'
    },

    // --- LAVORO ---
    { 
      id: 'stage', 
      title: 'Stage & Lavoro', 
      desc: 'Tirocini formativi e prime opportunità per entrare nel mondo del lavoro.', 
      icon: '💼', 
      category: 'Lavoro',
      link: '/student-hub/stage',
      color: 'bg-teal-500'
    },
    { 
      id: 'lavoretti', 
      title: 'Lavoretti Veloci', 
      desc: 'Cameriere per una sera, volantinaggio, o aiuto trasloco. Cash subito.', 
      icon: '💶', 
      category: 'Lavoro',
      link: '/community/bacheca',
      color: 'bg-orange-500'
    },

    // --- BENESSERE E COMMUNITY ---
    { 
      id: 'gruppi', 
      title: 'Gruppi di Studio', 
      desc: 'Organizza sessioni in biblioteca o crea un gruppo per un progetto.', 
      icon: '👥', 
      category: 'Community',
      link: '/community',
      color: 'bg-mbare-accent'
    },
    { 
      id: 'sportello', 
      title: 'Sportello d\'Ascolto', 
      desc: 'Ansia da esame? Parla con un professionista in modo anonimo.', 
      icon: '🧠', 
      category: 'Benessere',
      link: '#',
      color: 'bg-white'
    }
  ];

  // Filtro i servizi in base alla ricerca
  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Intestazione */}
        <div className="mb-12 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="font-mono text-sm text-mbare-accent uppercase mb-2 block">Area Riservata</span>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              Student<span className="text-mbare-accent">.</span> Hub
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4 max-w-2xl">
              Benvenuto {user?.email?.split('@')[0]}. Qua trovi tutto quello che ti serve per sopravvivere all'università.
            </p>
          </div>
          
          {/* Badge Studente */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-4 flex flex-col items-end shrink-0">
             <span className="font-mono text-xs text-mbare-muted uppercase">Il tuo status</span>
             <span className="font-display font-bold uppercase text-mbare-accent text-xl">Studente Attivo</span>
          </div>
        </div>

        {/* Barra di Ricerca Rapida */}
        <div className="mb-12 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mbare-muted group-focus-within:text-mbare-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Cerca cosa ti serve... (es. 'stanze', 'appunti', 'passaggio')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-mbare-surface border-2 border-mbare-border text-white pl-14 pr-4 py-5 focus:border-mbare-accent outline-none font-sans text-xl placeholder:text-mbare-muted transition-all shadow-[4px_4px_0_0_#222] focus:shadow-[4px_4px_0_0_#ff3b00]"
          />
        </div>

        {/* Se non ci sono risultati */}
        {filteredServices.length === 0 && (
          <div className="text-center py-20 border-2 border-mbare-border border-dashed">
            <p className="text-mbare-muted font-mono text-lg uppercase">Nessun servizio trovato per "{searchQuery}"</p>
            <p className="text-mbare-border font-sans mt-2">Prova a cercare qualcos'altro, o magari usa la Bacheca!</p>
          </div>
        )}

        {/* Griglia Servizi Dinamica */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Link 
              key={service.id} 
              to={service.link} 
              className="group bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col hover:border-mbare-accent hover:shadow-[6px_6px_0_0_#ff3b00] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Categoria Badge */}
              <span className="absolute top-4 right-4 font-mono text-[10px] text-mbare-muted uppercase border border-mbare-border px-2 py-0.5">
                {service.category}
              </span>

              {/* Icona (Emoji per semplicità, ma puoi usare SVG) */}
              <div className={`w-12 h-12 ${service.color} text-black flex items-center justify-center rounded-none mb-6 text-2xl shadow-[2px_2px_0_0_#fff] group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>

              {/* Testi */}
              <h3 className="text-2xl font-display font-bold uppercase mb-2 pr-16 text-white group-hover:text-mbare-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-mbare-muted font-sans text-sm flex-grow">
                {service.desc}
              </p>

              {/* Freccia in basso */}
              <div className="mt-6 flex items-center gap-2 text-mbare-white font-mono text-xs uppercase font-bold tracking-widest group-hover:gap-4 transition-all duration-300 border-t border-mbare-border pt-4">
                Accedi <span>→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}