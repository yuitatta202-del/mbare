export interface HubService {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: 'Studio' | 'Vita Quotidiana' | 'Lavoro' | 'Community' | 'Benessere';
  link: string;
  color: string;
}

export const HUB_SERVICES: HubService[] = [
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
    link: '/student-hub/stanze', // <-- AGGIORNATO: punta alla pagina dedicata
    color: 'bg-yellow-500'
  },
  { 
    id: 'coinquilini', 
    title: 'Match Coinquilini', 
    desc: 'Trova qualcuno con cui convivere senza rischiare di ammazzarvi.', 
    icon: '🤝', 
    category: 'Vita Quotidiana',
    link: '/profile', 
    color: 'bg-purple-500'
  },
  { 
    id: 'passaggi', 
    title: 'Passaggi & Carpooling', 
    desc: 'Torni a casa per il weekend? Offri o cerca un passaggio.', 
    icon: '🚗', 
    category: 'Vita Quotidiana',
    link: '/bacheca',
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