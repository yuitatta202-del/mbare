import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-mbare-black border-t-2 border-mbare-border pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        
        {/* Colonna 1: Brand & Info */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="font-display font-bold text-3xl uppercase tracking-tighter text-white hover:text-mbare-accent transition-colors">
            MBARE<span className="text-mbare-accent">.</span>
          </Link>
          <p className="text-mbare-muted font-sans text-sm">
            Il punto di riferimento per la vita universitaria. Notizie, community, e tutto quello che ti serve per sopravvivere (e divertirti) fuori e dentro l'aula.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="text-mbare-muted hover:text-mbare-accent font-mono text-xs uppercase transition-colors">IG</a>
            <a href="#" className="text-mbare-muted hover:text-mbare-accent font-mono text-xs uppercase transition-colors">TT</a>
            <a href="#" className="text-mbare-muted hover:text-mbare-accent font-mono text-xs uppercase transition-colors">DC</a>
          </div>
        </div>

        {/* Colonna 2: Navigazione */}
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-sm text-white uppercase font-bold mb-2">Esplora</h4>
          <Link to="/news" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">News & Articoli</Link>
          <Link to="/spiffera" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Il Muro del Drama</Link>
          <Link to="/arcade" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Mbare Arcade</Link>
          <Link to="/bacheca" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Bacheca Annunci</Link>
          <Link to="/student-hub" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Student Hub</Link>
        </div>

        {/* Colonna 3: Legale & Supporto */}
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-sm text-white uppercase font-bold mb-2">Supporto & Legale</h4>
          <Link to="/faq" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">FAQ & Come Funziona</Link>
          <Link to="/terms" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Termini di Servizio</Link>
          <Link to="/privacy" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Privacy Policy</Link>
          <Link to="/cookies" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Cookie Policy</Link>
          <a href="mailto:support@mbare.it" className="text-mbare-muted hover:text-mbare-accent font-sans text-sm transition-colors">Contattaci</a>
        </div>

        {/* Colonna 4: Le Mbare Coin */}
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-sm text-white uppercase font-bold mb-2">Mbare Coin</h4>
          <p className="text-mbare-muted font-sans text-sm mb-2">
            Le nostre monete virtuali per premiare la community.
          </p>
          <Link to="/faq" className="bg-mbare-surface border border-mbare-border p-3 text-center hover:border-mbare-accent transition-colors">
            <span className="block text-mbare-accent font-bold font-mono text-lg">🪙 Come guadagnare?</span>
            <span className="text-mbare-muted text-xs">Leggi la guida</span>
          </Link>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="max-w-7xl mx-auto border-t border-mbare-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono text-xs text-mbare-muted uppercase text-center md:text-left">
          © {currentYear} Mbare. Tutti i diritti riservati.
        </div>
        <div className="font-mono text-xs text-mbare-muted uppercase flex items-center gap-2">
          Made with <span className="text-mbare-accent">♥</span> in Italy
        </div>
      </div>
    </footer>
  );
}