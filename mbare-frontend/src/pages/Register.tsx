import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [matricola, setMatricola] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validazione base lato client (per UX, ma il backend farà controlli più severi)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username non valido. Usa solo lettere, numeri e underscore (3-20 caratteri).');
      setLoading(false);
      return;
    }

    if (isStudent && !/^\d{6,10}$/.test(matricola)) {
      setError('Matricola non valida. Deve essere numerica (6-10 cifre).');
      setLoading(false);
      return;
    }

    // 1. Registra l'utente in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Crea il profilo chiamando il BACKEND (API sicura)
    if (authData.user && authData.session) {
      try {
        const response = await fetch('http://localhost:3001/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Passiamo il token di Supabase per autenticarci
            'Authorization': `Bearer ${authData.session.access_token}`,
          },
          body: JSON.stringify({
            username,
            isStudent,
            matricola: isStudent ? matricola : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Se il backend fallisce (es. username già in uso), mostriamo l'errore
          throw new Error(errorData.error || 'Errore nella creazione del profilo');
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        // Se il profilo non viene creato, potremmo voler cancellare l'utente Supabase
        // (per ora lo lasciamo, ma in produzione andrebbe gestito)
        return;
      }
    }

    // Registrazione riuscita
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-16 px-6">
      <div className="w-full max-w-md bg-mbare-black border-2 border-mbare-border p-8 md:p-12 shadow-[8px_8px_0_0_#ff3b00]">
        <h1 className="text-5xl font-display font-bold uppercase tracking-tighter mb-2">
          Entra nel<br/>Gang<span className="text-mbare-accent">.</span>
        </h1>
        <p className="text-mbare-muted font-mono text-sm mb-8 uppercase">
          Crea il tuo account o sblocca i servizi per studenti.
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="es. SpicyBoy99"
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-3 transition-colors font-sans placeholder:text-mbare-border"
            />
            <p className="text-[10px] text-mbare-muted font-mono uppercase mt-1">
              * Solo lettere, numeri e underscore (3-20 caratteri).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-3 transition-colors font-sans"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-3 transition-colors font-sans"
            />
          </div>

          {/* Sezione Studenti */}
          <div className="border-t border-mbare-border pt-4 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className="w-5 h-5 accent-mbare-accent bg-transparent border-2 border-mbare-border"
              />
              <span className="font-mono text-sm text-mbare-white group-hover:text-mbare-accent transition-colors">
                Sono uno studente universitario
              </span>
            </label>

            {isStudent && (
              <div className="flex flex-col gap-2 mt-4 animate-slide-up">
                <label className="font-mono text-xs text-mbare-accent uppercase">Numero Matricola</label>
                <input
                  type="text"
                  value={matricola}
                  onChange={(e) => {
                    // Accetta solo numeri e massimo 10 cifre
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMatricola(value);
                  }}
                  required={isStudent}
                  placeholder="es. 1000071044"
                  maxLength={10}
                  className="bg-transparent border-b-2 border-mbare-accent focus:border-mbare-white outline-none text-mbare-white py-3 transition-colors font-sans placeholder:text-mbare-border"
                />
                <p className="text-[10px] text-mbare-muted font-mono uppercase mt-1 leading-tight">
                  * Inserisci la tua matricola (6-10 cifre). La verifica sblocca i servizi esclusivi.
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-mbare-accent font-mono text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-mbare-white text-mbare-black py-4 font-display font-bold text-xl uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Creazione...' : 'Registrati'}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-xs text-mbare-muted uppercase">
          Hai già un account?{' '}
          <Link to="/login" className="text-mbare-white hover:text-mbare-accent underline decoration-2 underline-offset-4">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}