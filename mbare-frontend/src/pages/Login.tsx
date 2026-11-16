import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // --- LOGICA DI REDIRECT INTELLIGENTE ---
    if (data.session) {
      // Decodifichiamo il token per leggere il ruolo
      const payload = JSON.parse(atob(data.session.access_token.split('.')[1]));
      const userRole = payload.user_role;

      // 1. SUPER_ADMIN o ADMIN -> Dashboard unificata
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        navigate('/super-admin');
      } 
      // 2. STUDENTE -> Student Hub
      else if (userRole === 'STUDENT') {
        navigate('/student-hub');
      } 
      // 3. USER -> Home
      else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-16 px-6">
      <div className="w-full max-w-md bg-mbare-black border-2 border-mbare-border p-8 md:p-12 shadow-[8px_8px_0_0_#ff3b00]">
        <h1 className="text-5xl font-display font-bold uppercase tracking-tighter mb-2">
          Bentornato<span className="text-mbare-accent">.</span>
        </h1>
        <p className="text-mbare-muted font-mono text-sm mb-8 uppercase">
          Accedi per continuare a spifferare.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-3 transition-colors font-sans"
            />
          </div>

          {error && <p className="text-mbare-accent font-mono text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-mbare-white text-mbare-black py-4 font-display font-bold text-xl uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : 'Accedi'}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-xs text-mbare-muted uppercase">
          Non hai un account?{' '}
          <Link to="/register" className="text-mbare-white hover:text-mbare-accent underline decoration-2 underline-offset-4">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}