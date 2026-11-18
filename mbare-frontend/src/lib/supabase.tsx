
import { createClient } from '@supabase/supabase-js';

// ==========================================
// MBARE - SUPABASE CLIENT
// React + Vite + TypeScript
// ==========================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();

const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

// ==========================================
// VALIDAZIONE CONFIGURAZIONE
// ==========================================

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[MBARE] Configurazione Supabase mancante. ' +
    'Verifica VITE_SUPABASE_URL e ' +
    'VITE_SUPABASE_PUBLISHABLE_KEY (oppure VITE_SUPABASE_ANON_KEY).'
  );
}

let validatedUrl: URL;

try {
  validatedUrl = new URL(supabaseUrl);
} catch {
  throw new Error(
    '[MBARE] VITE_SUPABASE_URL non è un URL valido.'
  );
}

if (
  validatedUrl.protocol !== 'https:' &&
  !(import.meta.env.DEV &&
    validatedUrl.hostname === 'localhost')
) {
  throw new Error(
    '[MBARE] Supabase richiede un URL HTTPS valido.'
  );
}

// ==========================================
// SUPABASE CLIENT
// ==========================================

export const supabase = createClient(
  validatedUrl.toString().replace(/\/$/, ''),
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'mbare-auth-session'
    },

    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },

    global: {
      headers: {
        'X-Client-Info': 'mbare-web'
      }
    }
  }
);

export default supabase;
