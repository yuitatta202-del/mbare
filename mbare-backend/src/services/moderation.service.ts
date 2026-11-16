import { prisma } from '../config/prisma.js';

// ==========================================
// BLACKLIST MODERAZIONE - COMMUNITY MBARE
// ==========================================
// Organizzata per categorie per facilitare la manutenzione.
// ATTENZIONE: usa solo radici quando possibile per catturare le varianti
// (es. "ammazz" cattura "ammazzati", "ammazzare", "ammazzerò").

const FORBIDDEN_WORDS = [
  // ------------------------------------------
  // 1. MINACCE E VIOLENZA (Blocco Immediato)
  // ------------------------------------------
  'ti uccido', 'ti ammazzo', 't\'ammazzo', 'ti spacco la faccia',
  'ti accoltello', 'ti brucio', 'ti faccio fuori', 'ti vengo a prendere',
  'ammazzati', 'ucciditi', 'impiccati', 'bruciati vivo',
  'sparati', 'tagliati le vene', 'fatti del male',
  'sgozzare', 'sgozzato', 'squartare', 'squartato',
  'stupro', 'stuprare', 'stupri', 'violentare',
  
  // ------------------------------------------
  // 2. ODIO E DISCRIMINAZIONE
  // ------------------------------------------
  'negro di merda', 'sporco negro', 'frocio', 'frocia', 'ricchione',
  'zingaro di merda', 'sporco ebreo', 'sporco terrone', 'sporco polentone',
  'handicappato di merda', 'mongoloide', 'ritardato mentale',
  'nazi', 'nazista', 'heil hitler', 'sieg heil',
  'terrorista di merda', 'islamico di merda',
  'kike', 'nigger', 'faggot', 'tranny', // Termini inglesi, se serve
  
  // ------------------------------------------
  // 3. INSULTI GRAVI (Sessisti/Violenti)
  // ------------------------------------------
  'puttana', 'puttaniere', 'zoccola', 'mignotta', 'troia',
  'cagna', 'cane bastardo', 'figlio di puttana', 'figlio di troia',
  'pezzo di merda', 'cesso umano', 'verme', 'lurido verme',
  'deficiente', 'ritardato', 'mongolo', 'scemo del villaggio',
  'cornuto', 'cuck', 
  
  // ------------------------------------------
  // 4. DOXING E PII (Privacy Violations)
  // ------------------------------------------
  'indirizzo di casa', 'dove abiti', 'via ', 'viale ',
  'numero di telefono', 'il suo numero', 'la sua email',
  'la sua foto', 'le sue foto', 'lo trovate qui',
  'cf:', 'codice fiscale', 'carta d\'identità',
  'sua madre', 'tua madre', 'tua sorella', // Spesso preludio a doxing sessuale
  'dove lavora', 'dove studia', 'in che classe',
  
  // ------------------------------------------
  // 5. SPAM E TRUFFE (Indicatori comuni)
  // ------------------------------------------
  'clicca qui', 'iscriviti subito', 'guadagna soldi', 'soldi facili',
  'criptovaluta gratis', 'bitcoin gratis', 'investi ora',
  'vinci un iphone', 'sei il nostro vincitore', 'premio in denaro',
  'whatsapp +', 'telegram +', 'contattami su', // Preludio a truffe
  'codice promo', 'codice sconto', // Spesso usati per spam
  'http://bit.ly', 'https://bit.ly', 't.me/', 'wa.me/',
  
  // ------------------------------------------
  // 6. DROGA E SOSTANZE (Illegale)
  // ------------------------------------------
  'cocaina', 'eroina', 'mdma', 'ecstasy', 'anfetamina',
  'marijuana', 'hashish', 'fumo da vendere',
  'spaccio', 'spacciatore', 'vendesi droga',
  'lsd', 'ketamina', 'popper', 'ghb',
  
  // ------------------------------------------
  // 7. CONTENUTI SESSUALI ESPLICITI (Gambling/OnlyFans mascherati)
  // ------------------------------------------
  'onlyfans', 'porno', 'pornografico', 'sesso a pagare',
  'prostituta', 'prostituzione', 'escort',
  'nudi gratis', 'nuda su', 'sesso gratis', 'video intimi',
  'sexting', 'nudes',
  
  // ------------------------------------------
  // 8. GAMBLING E SCOMMESSE (Regolamentato)
  // ------------------------------------------
  'scommesse sicure', 'betting sicuro', 'casinò online',
  'slot machine', 'roulette online', 'poker online',
  'vincite garantite', 'scommetti con noi',
  
  // ------------------------------------------
  // 9. AGGIRAMENTI COMUNI (Leet-speak base)
  // ------------------------------------------
  // La Perspective API cattura il resto, ma questi sono bypass troppo comuni
  't1 ucc1do', 't1 ammazzo', 'p0rco', 'p0ttana', 'tr0ia',
  'v4ffanculo', 'm3rda', 'c4zz0', 'c4zzo', 'st0nzo',
  'c0gli0ne', 'cogl10ne', 'd10can', // Patterns comuni
];

// ==========================================
// CONFIGURAZIONE SOGLIE
// ==========================================
// 0.00 - 0.02  → Approvato
// 0.70 - 0.85  → Pending (Revisione Umana)
// 0.85 - 1.00  → Rifiutato
const SEVERITY_THRESHOLD = 0.02;

export class ModerationService {
  /**
   * Analizza un testo e restituisce se deve essere approvato, pending o rifiutato.
   */
  static async analyzeText(text: string): Promise<'approved' | 'pending' | 'rejected'> {
    const lowerText = text.toLowerCase();

    // LAYER 1: Blacklist locale (blocco immediato)
    const hasForbiddenWord = FORBIDDEN_WORDS.some(word => lowerText.includes(word));
    if (hasForbiddenWord) {
      return 'rejected';
    }

    // LAYER 2: Analisi AI (se hai una API Key)
    const apiKey = process.env.PERSPECTIVE_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: { text },
            languages: ['it'],
            requestedAttributes: { 
              TOXICITY: {}, 
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              THREAT: {}
            }
          })
        });

        const data = await response.json();
        
        // Prendiamo il punteggio massimo di tossicità
        const toxicity = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
        const threat = data.attributeScores?.THREAT?.summaryScore?.value || 0;
        const identityAttack = data.attributeScores?.IDENTITY_ATTACK?.summaryScore?.value || 0;
        
        const maxScore = Math.max(toxicity, threat, identityAttack);

        if (maxScore > 2.5) return 'rejected';  // Molto tossico: blocco
        if (maxScore > SEVERITY_THRESHOLD) return 'pending'; // Dubbio: revisione umana
        return 'approved'; // Sicuro
      } catch (err) {
        console.error('Errore Perspective API:', err);
        // Se l'API fallisce, mettiamo in pending per sicurezza
        return 'pending';
      }
    }

    // LAYER 3: Se non hai l'API, approviamo (o mettiamo pending a tuo piacimento)
    return 'approved'; 
  }
}