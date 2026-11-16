import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        <Link to="/" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-8 block transition-colors">
          ← Torna alla Home
        </Link>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none mb-4">
          Termini di Servizio<span className="text-mbare-accent">.</span>
        </h1>
        <p className="text-mbare-muted font-mono text-sm mb-8">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </p>

        {/* Avviso in stile Mbare */}
        <div className="bg-mbare-surface border-2 border-mbare-accent p-6 mb-12 flex gap-4 items-start">
          <span className="text-4xl">⚠️</span>
          <div>
            <h4 className="font-display font-bold uppercase text-white mb-2 text-lg">Nota bene, picciotti.</h4>
            <p className="font-sans text-mbare-muted">
              So che nessuno legge i Termini di Servizio, ma se usi Mbare stai accettando tutto quello che c'è scritto qui sotto. Non è noia legale, è la legge di strada della piattaforma. Leggilo, capiscilo, e non rompere le scatole.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-sm md:prose-base font-sans text-mbare-white 
                        prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter
                        prose-h2:text-3xl prose-h2:border-b prose-h2:border-mbare-border prose-h2:pb-2 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:text-mbare-accent prose-h3:mt-6 prose-h3:mb-2
                        prose-p:leading-relaxed prose-strong:text-mbare-accent prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2">
          
          <h2>1. Chi Siamo e Cosa Accetti</h2>
          <p>Benvenuto su Mbare. Accedendo, navigando o cliccando qualsiasi cosa (compresi i botti che sembrano inutili), dichiari di aver letto, compreso e accettato questi Termini di Servizio. Se non sei d'accordo con anche una sola virgola, ti invitiamo ad accettare il fatto che forse non sei pronto per la community e sei libero di andartene. La piattaforma è gestita da "U Capu" (il Super Admin) e dalla sua squadra di Moderatori.</p>

          <h2>2. Requisiti e Account</h2>
          <p>Per entrare nello Student Hub e fare cose fighe, devi registrarti. Ecco le regole d'oro:</p>
          <ul>
            <li><strong>Identità Reale</strong>: Non creare account fake per spiare gli altri o fare il doppio gioco. Se ti becchiamo (e ti becchiamo), ciao ciao account.</li>
            <li><strong>La tua responsabilità</strong>: Sei l'unico responsabile della tua password. Se te la fai rubare dal tuo coinquilino perché l'hai scritta su un post-it attaccato al frigo, non è colpa nostra.</li>
            <li><strong>Età</strong>: Mbare è pensato per studenti universitari. Se hai meno di 14 anni, chiedi il permesso ai tuoi genitori o aspetta qualche anno.</li>
          </ul>

          <h2>3. Regole di Condotta (Non fare il maleducato)</h2>
          <p>Mbare è un posto per spifferare, vendere libri, scambiare appunti, <strong>comprare/vendere biglietti per concerti</strong> e organizzare gruppi di studio. Non è il far west. Ecco cosa <strong>non</strong> puoi fare:</p>
          <ul>
            <li>Pubblicare bestemmie gratuite, minacce, odio razziale o contenuti che violano la dignità delle persone (nei limiti del buon senso e della satira studentesca).</li>
            <li>Usare la Bacheca per vendere armi, droga o cose che non sono libri, appunti e biglietti per il concerto. Se lo fai, la polizia bussa a casa tua, non a casa nostra.</li>
            <li>Spammare link pubblicitari o cercare di rubare i dati degli altri utenti.</li>
            <li>Usare le Spiffere per fare doxing (rivelare informazioni personali) di altre persone reali.</li>
          </ul>

          {/* REGOLA DEI 5 STRIKES E IP BAN */}
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-6 not-prose">
            <h4 className="font-display font-bold uppercase text-red-500 mb-2 flex items-center gap-2">
              <span>🚫</span> Sistema a Punti e Ban Definitivo
            </h4>
            <p className="font-sans text-sm text-mbare-white mb-2">
              Non siamo i Carabinieri, ma non siamo nemmeno fessi. Abbiamo un sistema a tolleranza zero:
            </p>
            <ul className="list-disc pl-5 text-sm text-mbare-muted space-y-1">
              <li><strong>1ª Violazione</strong>: Warning ufficiale (te ne accorgerai).</li>
              <li><strong>2ª e 3ª Violazione</strong>: Sospensione temporanea (ti togliamo il giocattolo per qualche giorno).</li>
              <li><strong>5ª Violazione</strong>: <span className="text-red-400 font-bold">Ban Definitivo.</span> L'account viene eliminato e non potrai più accedere.</li>
            </ul>
            <p className="font-sans text-sm text-mbare-white mt-3 font-bold">
              E per i "furbetti del quartierino": tracciamo l'IP e le informazioni del dispositivo (Device Fingerprint) quando ti registri. Se provi a creare un nuovo account per aggirare il ban, il sistema ti bloccherà in automatico. Ti conviene rigare dritto.
            </p>
          </div>

          <h2>4. L'Economia delle "Mbare Coin" (Fondamentale)</h2>
          <p>Qui si fa sul serio. Le Mbare Coin sono l'ossigeno della community, ma dobbiamo mettere i puntini sulle i:</p>
          <p><strong>Le Mbare Coin NON sono soldi reali.</strong> Non sono criptovalute, non sono un titolo finanziario e non valgono un cazzo in Euro. Servono solo ed esclusivamente per sbloccare feature sulla piattaforma. Non puoi venderle a nessuno, non puoi comprarle con la carta di credito e non puoi pretenderle indietro se vieni bannato.</p>
          <p>Ci riserviamo il diritto (e il dovere) di <strong>tassare, azzerare o rimuovere</strong> le Coin da qualsiasi account in caso di:</p>
          <ul>
            <li>Sospetta frode o uso di bot per accumularle (farming).</li>
            <li>Violazione delle regole della community.</li>
            <li>Mancanza di rispetto verso i Moderatori.</li>
          </ul>

          <h2>5. Proprietà Intellettuale e Contenuti Generati dagli Utenti (UGC)</h2>
          <p>Qui si fa sul serio, quindi leggere bene. Quando pubblichi una Spiffera, una News, un commento o un annuncio in Bacheca, la situazione è questa:</p>
          
          <h3>A. La roba tua rimane tua</h3>
          <p>Mbare non rivendica la proprietà intellettuale dei contenuti originali che pubblichi. Se scrivi un articolo bellissimo, fai una foto o scrivi una Spiffera da premio Pulitzer, il copyright e la paternità rimangono al 100% tuoi. Nessuno ti ruberà l'idea per farci un film (per ora).</p>

          <h3>B. La Licenza di Mbare (Perché ci serve)</h3>
          <p>Per farti vedere il tuo post agli altri utenti, Mbare ha bisogno di una licenza. Pubblicando un contenuto, ci concedi una licenza <strong>gratuita, mondiale, non esclusiva, trasferibile e sub-licenziabile</strong>. Che cavolo significa in parole povere? Che possiamo:</p>
          <ul>
            <li><strong>Mostrare</strong> il tuo contenuto sulla piattaforma web e mobile.</li>
            <li><strong>Formattarlo e adattarlo</strong> (es. tagliare una foto per farla stare nella card, o impaginare il testo per renderlo leggibile su mobile).</li>
            <li><strong>Distribuirlo</strong> tramite i server e i sistemi di caching che usiamo (es. Supabase o i CDN per le immagini).</li>
            <li><strong>Sotto-licenziarlo</strong> ai nostri fornitori di servizi tecnici (es. il server che ospita il database), ma solo per far funzionare il sito.</li>
          </ul>

          <h3>C. Promozione e Social Media (La parte divertente)</h3>
          <p>Mbare è una community, e ci piace farci pubblicità. Ci concedi anche il diritto di usare i tuoi contenuti (in modo non diffamatorio) per promuovere la piattaforma. Quindi, se pubblichi una Spiffera esilarante, potremmo farne una grafica e postarla sulla pagina Instagram di Mbare o farci un meme. <strong>Se si tratta di contenuti personali sensibili (es. una tua foto), ti chiederemo sempre il permesso esplicito prima di postarla sui nostri canali social.</strong> Per i testi (Spiffere, commenti, annunci), invece, è tutto incluso nella licenza.</p>

          <h3>D. Se cancelli il contenuto</h3>
          <p>Se decidi di eliminare una tua News, una Spiffera o un annuncio, la licenza che ci hai dato si interrompe per quanto riguarda quel contenuto sulla piattaforma. Tuttavia, Mbare potrebbe mantenere delle copie di backup per motivi tecnici/legali per un certo periodo, e non possiamo controllare se un altro utente ha fatto uno screenshot del tuo post. Quindi, pensaci bene prima di pubblicare cose di cui potresti pentirti.</p>

          <h3>E. Copyright e Diritti di Terzi (Non fare il pirata)</h3>
          <p>Pubblicando un contenuto, dichiari e garantisci di essere il legittimo proprietario o di avere tutte le autorizzazioni necessarie per usarlo. <strong>È severamente vietato caricare articoli copiati da altri siti web (plagio), foto rubate da Google Immagini o musica protetta da copyright.</strong> Se riceviamo una segnalazione per violazione del copyright (DMCA), rimuoveremo immediatamente il contenuto e, se recidivo, il tuo account verrà bannato.</p>

          <h3>F. Manleva (Scarico di responsabilità)</h3>
          <p>Sei l'unico ed esclusivo responsabile dei contenuti che pubblichi. Se il tuo post viola leggi, diritti d'autore, privacy di terzi o diffama qualcuno, Mbare non c'entra nulla. Se terzi fanno causa a Mbare per colpa di quello che hai scritto tu, tu accetti di manlevare (cioè di coprire economicamente) Mbare da tutte le spese legali e i danni.</p>

          <h2>6. Moderazione, Ban e "Legge Marziale"</h2>
          <p>Gli Admin e i Moderatori hanno l'ultima parola. Se un contenuto viene segnalato, verrà valutato. Se infrangi le regole, puoi essere avvertito, sospeso (temporaneamente) o bannato (per sempre). Non accettiamo ricorsi via DM su Instagram di gente che si lamenta perché ha insultato un professore e le ha prese. Prenditi le tue responsabilità.</p>
          <p>La moderazione è insindacabile. Se pensi che un ban sia ingiusto, scrivi a support@mbare.it in modo educato, e ci sarà un essere umano (non un bot) a leggere.</p>

          <h2>7. Limitazione di Responsabilità (Il classico scarico di colpa)</h2>
          <p>Mbare è una piattaforma di incontro. Se compri un biglietto falso in Bacheca da un tizio strano, se il tuo tutor di Ripetizioni non si presenta all'appuntamento, o se segui un consiglio di studio da un articolo e prendi 18 all'esame, <strong>non è colpa nostra</strong>. Noi mettiamo solo la piazza, la merce la metti tu. Faremo del nostro meglio per bannare i truffatori, ma il rischio della compravendita è tuo. Allo stesso modo, non siamo responsabili se il sito va giù, se perdiamo i dati (anche se i backup li facciamo), o se il tuo coinquilino decide di staccare il wifi per giocare alla Play.</p>

          <h2>8. Modifiche ai Termini</h2>
          <p>Possiamo cambiare queste regole in qualsiasi momento, aggiungendo o togliendo cose. Se facciamo modifiche sostanziali, ti avviseremo con una notifica sulla piattaforma. Se continui a usare il sito dopo le modifiche, significa che accetti le nuove regole. Non venire a dire "eh ma non me l'avevi detto".</p>

          <h2>9. Chiudere i battenti</h2>
          <p>Puoi cancellare il tuo account in qualsiasi momento dal tuo Profilo. Ricorda che cancellando l'account perdi tutti i tuoi dati, i tuoi post e il saldo delle Mbare Coin, e non c'è modo di recuperarli (il diritto all'oblio è sacro). Se vuoi che cancelliamo tutto manualmente, scrivici.</p>
          
          <hr className="border-mbare-border my-8" />

          <p className="text-center font-mono text-sm text-mbare-muted mt-12">
            Buona permanenza su Mbare. E mi raccomando, non sbattere la porta quando esci.
          </p>
        </div>



      </div>
    </div>
  );
}