import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center bg-mbare-black text-mbare-white">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-12 border-b-2 border-mbare-border pb-8">
          <Link to="/" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-4 block transition-colors">
            ← Torna alla Home
          </Link>
          <h1 className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none mb-4">
            Privacy Policy<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-mono text-sm uppercase tracking-widest">
            Conforme al GDPR (Regolamento UE 2016/679)
          </p>
        </div>

        {/* Box Introduttivo */}
        <div className="bg-mbare-surface border-2 border-mbare-accent p-6 md:p-8 mb-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10 flex gap-4 items-start">
            <span className="text-4xl">🛡️</span>
            <div>
              <h4 className="font-display font-bold uppercase text-white mb-2 text-xl">La tua privacy è sacra.</h4>
              <p className="font-sans text-mbare-muted text-lg">
                Su Mbare non vendiamo i tuoi dati al miglior offerente. Prendiamo solo le informazioni necessarie per far funzionare la piattaforma, tenerti al sicuro e farti trovare quello che cerchi (come una stanza o un tutor).
              </p>
            </div>
          </div>
        </div>

        {/* Contenuto della Privacy in stile Brutalista */}
        <div className="flex flex-col gap-6">
          
          {/* Sezione 1 */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 md:p-8 hover:border-mbare-white transition-colors">
            <h2 className="font-display font-bold uppercase text-2xl mb-4 flex items-center gap-3">
              <span className="text-mbare-accent font-mono">01.</span> Cosa raccogliamo
            </h2>
            <div className="font-sans text-mbare-muted space-y-3">
              <p>Raccogliamo solo quello che ci serve per farti usare Mbare:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Dati di Registrazione:</strong> Email, username, e (se decidi di diventare studente) i tuoi dati universitari come matricola e corso di studi.</li>
                <li><strong className="text-white">Contenuti che pubblichi:</strong> Post, commenti, spiffere, annunci in Bacheca. Ricorda che le Spiffere sono anonime per gli altri utenti, ma associate al tuo account per motivi di moderazione.</li>
                <li><strong className="text-white">Dati tecnici di sicurezza:</strong> Raccogliamo informazioni di base sul dispositivo e log di sistema per evitare frodi, attacchi hacker e account fake. Questi dati non vengono mai usati per farti pubblicità.</li>
              </ul>
            </div>
          </div>

          {/* Sezione 2 */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 md:p-8 hover:border-mbare-white transition-colors">
            <h2 className="font-display font-bold uppercase text-2xl mb-4 flex items-center gap-3">
              <span className="text-mbare-accent font-mono">02.</span> Perché usiamo i tuoi dati
            </h2>
            <div className="font-sans text-mbare-muted space-y-3">
              <p>I tuoi dati ci servono per:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Creare e gestire il tuo account.</li>
                <li><strong className="text-white">Garantire la sicurezza:</strong> Rilevare e bloccare spam, bot, e comportamenti tossici (tramite i nostri sistemi di moderazione).</li>
                <li><strong className="text-white">Personalizzare l'esperienza:</strong> Mostrarti eventi nella tua città o annunci di stanze vicino alla tua università.</li>
                <li>Inviarti notifiche relative alla community (ma solo se hai dato il consenso, non siamo stalker).</li>
              </ul>
            </div>
          </div>

          {/* Sezione 3 */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 md:p-8 hover:border-mbare-white transition-colors">
            <h2 className="font-display font-bold uppercase text-2xl mb-4 flex items-center gap-3">
              <span className="text-mbare-accent font-mono">03.</span> Con chi condividiamo i dati
            </h2>
            <div className="font-sans text-mbare-muted space-y-3">
              <p>Noi non vendiamo i tuoi dati a nessuno. Mai. Per far funzionare il sito, ci affidiamo a fornitori tecnici di altissimo livello che agiscono come "Responsabili del Trattamento" nel pieno rispetto del GDPR:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Supabase:</strong> Per l'autenticazione, la gestione del database e la sicurezza dei server.</li>
                <li><strong className="text-white">OpenAI (Moderazione AI):</strong> I testi dei commenti che pubblichi vengono analizzati automaticamente da un sistema di Intelligenza Artificiale per filtrare insulti, minacce e spam. OpenAI non usa questi testi per addestrare i suoi modelli pubblici.</li>
              </ul>
            </div>
          </div>

          {/* Sezione 4 */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 md:p-8 hover:border-mbare-white transition-colors">
            <h2 className="font-display font-bold uppercase text-2xl mb-4 flex items-center gap-3">
              <span className="text-mbare-accent font-mono">04.</span> I tuoi diritti (GDPR)
            </h2>
            <div className="font-sans text-mbare-muted space-y-3">
              <p>In qualsiasi momento hai il diritto di:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Accedere:</strong> Chiederci una copia dei dati che abbiamo su di te.</li>
                <li><strong className="text-white">Rettificare:</strong> Correggere dati sbagliati dal tuo profilo.</li>
                <li><strong className="text-white">Cancellare (Diritto all'Oblio):</strong> Puoi eliminare il tuo account in qualsiasi momento. Questo cancellerà definitivamente i tuoi dati personali, i tuoi post, i tuoi commenti e il tuo wallet delle Mbare Coin. Non c'è modo di recuperarli.</li>
              </ul>
              <p className="mt-4 pt-4 border-t border-mbare-border/50 text-sm">
                Per esercitare questi diritti, usa le impostazioni del tuo profilo o scrivici a <a href="mailto:privacy@mbare.it" className="text-mbare-accent font-bold hover:underline">privacy@mbare.it</a>.
              </p>
            </div>
          </div>

          {/* Sezione 5 */}
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 md:p-8 hover:border-mbare-white transition-colors">
            <h2 className="font-display font-bold uppercase text-2xl mb-4 flex items-center gap-3">
              <span className="text-mbare-accent font-mono">05.</span> Cookie
            </h2>
            <div className="font-sans text-mbare-muted space-y-3">
              <p>Utilizziamo esclusivamente <strong className="text-white">cookie tecnici</strong>. Servono solo per tenerti loggato quando passi da una pagina all'altra. Non usiamo cookie pubblicitari invasivi, né tracciamo i tuoi movimenti sul web al di fuori di Mbare.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}