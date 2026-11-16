import { Link } from 'react-router-dom';
import { ScrambleText } from '../components/ScrambleText';

export function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen pt-32 pb-16 px-6 relative overflow-hidden">
      
      {/* Testo decorativo dietro */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <h1 className="text-[35vw] font-display font-bold leading-none tracking-tighter">MBARE</h1>
      </div>

      <div className="z-10 text-center flex flex-col items-center w-full max-w-5xl">
        
        {/* Titolo con effetto Scramble e slogan "U Campus To. Spacchioso." */}
        <h1 className="text-5xl sm:text-7xl md:text-[7rem] lg:text-[8rem] xl:text-[9rem] font-display font-bold leading-[0.85] tracking-tighter uppercase mb-8 flex flex-col items-center">
          <ScrambleText text="U Campus" />
          <span className="text-mbare-accent">
            <ScrambleText text="To." />
          </span>
          <ScrambleText text="Spacchioso." />
        </h1>
        
        {/* Sottotitolo */}
        <p className="text-lg md:text-2xl text-mbare-muted max-w-2xl mx-auto mb-12 font-sans font-medium animate-slide-up px-4">
          Notizie vere, confessioni piccanti, eventi e gruppi di studio. 
          <span className="text-mbare-white font-bold"> Tutto quello che ti serve per sopravvivere all'università.</span>
        </p>

        {/* Bottoni principali */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-3xl animate-slide-up">
          <Link 
            to="/community" 
            className="bg-mbare-white text-mbare-black px-10 py-5 text-xl font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all duration-200 border-2 border-mbare-white hover:border-mbare-accent w-full sm:w-auto text-center cursor-none"
          >
            Esplora la Community
          </Link>
          
          <Link 
            to="/news" 
            className="bg-transparent text-mbare-white px-10 py-5 text-xl font-bold uppercase tracking-tighter border-2 border-mbare-border hover:border-mbare-white transition-all duration-200 w-full sm:w-auto text-center cursor-none"
          >
            Leggi le News
          </Link>
        </div>

      </div>
    </main>
  );
}