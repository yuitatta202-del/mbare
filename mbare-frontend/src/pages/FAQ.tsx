import { useState } from 'react';
import { Link } from 'react-router-dom';

export function FAQ() {
  // Stato per gestire l'apertura/chiusura delle domande (Accordion)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    // --- REGOLE DI BASE ---
    {
      category: "Regole di Base",
      question: "Ma le Mbare Coin valgono soldi veri?",
      answer: "Assolutamente no, minchia! Le Mbare Coin sono 'punti fedeltà' virtuali. Non possono essere convertite in euro, non sono criptovalute e non valgono nulla al di fuori della piattaforma Mbare. Servono solo per sbloccare vantaggi, far crescere la community e farti sentire 'U Capu' del quartiere."
    },
    {
      category: "Regole di Base",
      question: "Posso comprare Mbare Coin con la carta di credito?",
      answer: "No. L'economia di Mbare è basata sul merito e sulla partecipazione. Le Coin si guadagnano solo interagendo in modo costruttivo (scrivendo news, commentando o vincendo all'Arcade). Non è un casinò e non vogliamo che lo diventi."
    },
    {
      category: "Regole di Base",
      question: "Cosa succede se trovo un bug o un errore nel sito?",
      answer: "Se trovi un bug (non un errore di battitura, ma qualcosa che non funziona), scrivici subito a support@mbare.it! I 'Bug Hunter' che ci segnalano falle di sicurezza o problemi gravi ricevono un premio in Mbare Coin e, a volte, un badge speciale sul profilo. Non abusare dei bug per arricchirti, però, o ti banniamo."
    },

    // --- MBARE COIN ---
    {
      category: "Mbare Coin",
      question: "Come faccio a guadagnare Mbare Coin?",
      answer: "Ci sono diversi modi, tutti basati sul comportamento virtuoso:\n• +10 Coin: per ogni News o articolo pubblicato e approvato.\n• +5 Coin: per ogni commento utile o Spiffera approvata.\n• +50 Coin (o più): se vinci le sfide nell'Arcade.\n• Bonus segreti: ogni tanto rilasciamo premi per chi aiuta la community o partecipa agli eventi."
    },
    {
      category: "Mbare Coin",
      question: "In cosa posso spendere le mie monete?",
      answer: "Le Coin servono per distinguerti e dare una mano alla community:\n• 20 Coin: per mettere in evidenza un tuo annuncio in Bacheca per 3 giorni.\n• 50 Coin: per cambiare il colore del tuo nome o sbloccare un frame speciale per il profilo.\n• 10 Coin: per sbloccare la lettura di una Spiffera particolarmente 'Spicy'.\n• Molto altro in arrivo!"
    },
    {
      category: "Mbare Coin",
      question: "Ho fatto un account falso per votarmi da solo. Cosa succede?",
      answer: "Il sistema ha occhi ovunque. Se scopriamo account fake, bot o tentativi di truffa per accumulare Coin (il cosiddetto 'farming'), l'account viene bannato all'istante e il saldo delle tue Coin viene azzerato. Non siamo nati ieri."
    },
    {
      category: "Mbare Coin",
      question: "Perché alcuni utenti hanno un badge che costa 10.000 Coin?",
      answer: "Perché l'economia va tenuta in equilibrio! I 'Sink' (le dispersioni) servono a togliere monete dal sistema, altrimenti ci sarebbe troppa inflazione e le monete non varrebbero più niente. Il badge 'Re di Mbare' costa 10.000 Coin, non ti dà nessun potere in più, ma ti fa sembrare un boss a tutti gli effetti. È puro status symbol."
    },

    // --- COMMUNITY & STUDENT HUB ---
    {
      category: "Community & Student Hub",
      question: "Come funziona la sezione Ripetizioni?",
      answer: "Nello Student Hub, nella sezione 'Ripetizioni', puoi pubblicare annunci se offri lezioni (es. di Analisi 1) o se ne cerchi. Puoi specificare materia, facoltà e anno. Per evitare spam di numeri di telefono, i contatti avvengono tramite la chat interna della piattaforma."
    },
    {
      category: "Community & Student Hub",
      question: "Ho comprato un biglietto da un tizio in Bacheca ed era falso. Cosa faccio?",
      answer: "La Bacheca è un mercatino tra studenti, ma non possiamo garantire per tutti. Se vieni truffato, segnala immediatamente l'annuncio cliccando sulla bandierina. L'admin interverrà, eliminerà l'annuncio e se le prove sono schiaccianti, bannerà il truffatore. Consiglio: incontra sempre di persona in luoghi pubblici!"
    },
    {
      category: "Community & Student Hub",
      question: "Le Spiffere sono davvero anonime?",
      answer: "Sì, quando pubblichi una Spiffera il tuo nome non viene mostrato agli altri utenti. Tuttavia, per motivi di sicurezza e moderazione, il tuo ID utente viene salvato nel database. Se le regole della community vengono violate (es. minacce o odio), gli admin possono risalire a te e bannarti."
    },
    {
      category: "Community & Student Hub",
      question: "Chi decide se un evento o un gruppo è approvato?",
      answer: "Gli Admin e i Moderatori controllano ogni evento o gruppo creato. Assicurati che le informazioni siano vere e che l'evento rispetti le regole. Se l'evento viene rifiutato, non prendertela: potrebbe essere stato segnalato come spam o non conforme."
    },

    // --- ACCOUNT & PRIVACY ---
    {
      category: "Account & Privacy",
      question: "Come posso cancellare il mio account e i miei dati?",
      answer: "Puoi cancellare il tuo account in qualsiasi momento dalla pagina del Profilo. Questa azione rimuoverà definitivamente i tuoi dati personali, i tuoi post, i tuoi commenti e il tuo wallet delle Mbare Coin, nel pieno rispetto del GDPR (Diritto all'Oblio)."
    },
    {
      category: "Account & Privacy",
      question: "Riceverò mille notifiche spam?",
      answer: "No. Abbiamo creato il sistema 'Broadcast' per avvisarti solo di cose importanti (es. eventi in città, nuovi giochi, cambiamenti di regole). Rispettiamo il tuo sonno e il tuo GDPR."
    },

    // --- MBARE LORE & CURIOSITÀ ---
    {
      category: "Mbare Lore & Curiosità",
      question: "Perché la piattaforma si chiama Mbare?",
      answer: "Il nome nasce dal gergo di strada. 'Mbari' o 'Mbà' è un termine tipico (soprattutto in Sicilia) per dire 'compare', 'amico', 'fratello'. È un modo per dire 'ehi, ciao, tutto a posto'. Siamo nati per essere il punto di riferimento informale ma serio della tua vita universitaria."
    },
    {
      category: "Mbare Lore & Curiosità",
      question: "Che fine fanno le Spiffere rifiutate?",
      answer: "Le Spiffere rifiutate finiscono nel 'Cimitero delle Spiffere' (un database a parte). Non vengono cancellate subito del tutto per permettere agli admin di controllare eventuali recidivi o per evitare che l'autore le ripubblichi subito. Sono invisibili al pubblico per sempre."
    },
    {
      category: "Mbare Lore & Curiosità",
      question: "Chi è 'U Capu' Totale?",
      answer: "'U Capu' è il titolo che diamo al Super Admin. È la persona che gestisce l'infrastruttura, le finanze (le Coin) e ha l'ultima parola sulle decisioni. Nel pannello admin vedrai questo titolo. Non è un dittatore, ma qualcuno deve pur tenere il timone!"
    },
    {
      category: "Mbare Lore & Curiosità",
      question: "Ci sono Easter Egg (uova di pasqua) nascosti nel sito?",
      answer: "Assolutamente sì. Prova a cliccare su alcuni elementi grafici, a usare lo slider Spicy in modo strano, o a cercare parole particolari nella Bacheca. Se trovi un easter egg, fai uno screenshot e mandalo al supporto: potresti vincere delle Coin! (Non diciamo quali sono per non rovinare la sorpresa)."
    },
    {
      category: "Mbare Lore & Curiosità",
      question: "Come è fatto questo sito a livello tecnico?",
      answer: "Per i nerd: il frontend è costruito in React + TypeScript con TailwindCSS (per lo stile brutalista). Il backend usa Node.js (Express) e Prisma come ORM. Il database e l'autenticazione sono gestiti da Supabase (PostgreSQL). E l'Arcade usa i React Hooks per gestire i giochi."
    }
  ];

  // Raggruppiamo le FAQ per categoria
  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center bg-mbare-black text-mbare-white">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-16 border-b-2 border-mbare-border pb-8">
          <Link to="/" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-4 block transition-colors">
            ← Torna alla Home
          </Link>
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none">
            FAQ<span className="text-mbare-accent">.</span>
          </h1>
          <p className="text-mbare-muted font-sans text-xl mt-4 max-w-2xl">
            Tutto quello che devi sapere per non finire in bancarotta (virtuale) e per capire come funziona la piattaforma.
          </p>
        </div>

        {/* Lista FAQ */}
        <div className="flex flex-col gap-12">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="font-mono text-sm text-mbare-accent uppercase mb-6 tracking-widest border-b border-mbare-border pb-2 inline-block">
                {cat}
              </h2>
              
              <div className="flex flex-col gap-3">
                {faqs.filter(f => f.category === cat).map((faq) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div 
                      key={globalIndex} 
                      className={`bg-mbare-surface border-2 transition-colors duration-300 ${isOpen ? 'border-mbare-accent' : 'border-mbare-border hover:border-mbare-white'}`}
                    >
                      <button 
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full text-left p-5 flex justify-between items-center gap-4 outline-none"
                      >
                        <span className={`font-display font-bold text-lg md:text-xl uppercase transition-colors ${isOpen ? 'text-mbare-accent' : 'text-white'}`}>
                          {faq.question}
                        </span>
                        <span className={`text-3xl font-mono transition-transform duration-300 ${isOpen ? 'rotate-45 text-mbare-accent' : 'text-mbare-muted'}`}>
                          +
                        </span>
                      </button>
                      
                      <div 
                        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="p-5 pt-0 text-mbare-muted font-sans text-base md:text-lg whitespace-pre-line border-t border-mbare-border/50 mt-2">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>



      </div>
    </div>
  );
}