import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 1. PACCHETTI COIN (Studenti-friendly)
const COIN_PACKAGES = [
  { id: 'caffe',  label: 'Caffè',      coins: 50,   price: 1.50, bonus: 0,    popular: false, icon: '☕' },
  { id: 'pizza',  label: 'Pizza',      coins: 200,  price: 5.00, bonus: 20,   popular: true,  icon: '🍕' },
  { id: 'serata', label: 'Serata',     coins: 500,  price: 10.00, bonus: 100, popular: false, icon: '🍻' },
  { id: 'ricco',  label: 'Mbare Boss', coins: 1000, price: 15.00, bonus: 300, popular: false, icon: '👑' },
];

// 2. ARTICOLI PREMIUM (Cosmetici & Sponsorizzazioni)
const PREMIUM_ITEMS = [
  { id: 'super_bump', label: 'Super Bump', desc: 'Metti in evidenza un tuo annuncio per 7 giorni.', price: 2.50, icon: '🚀' },
  { id: 'frame_fire', label: 'Cornice Fuoco', desc: 'Un avatar incendiario per il tuo profilo.', price: 1.50, icon: '🔥' },
  { id: 'title_boss', label: 'Titolo: U Capu', desc: 'Fatti chiamare "U Capu" sotto il tuo nome.', price: 2.00, icon: '👑' },
  { id: 'title_nerd', label: 'Titolo: Nerd', desc: 'Mostra a tutti chi comanda sui libri.', price: 1.00, icon: '🤓' },
];

export function Shop() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const historyRes = await fetch(`${API_URL}/payments/history`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (historyRes.ok) setHistory(await historyRes.json());

      const walletRes = await fetch(`${API_URL}/tokens/wallet`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setCurrentBalance(walletData.balance || 0);
      }
    } catch (err) {
      console.error('Errore caricamento dati shop:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Funzione generica per avviare il checkout di qualsiasi prodotto
  const handleBuy = async (productId: string, type: 'coin' | 'subscription' | 'item' = 'coin') => {
    if (!user) {
      alert('Devi essere loggato per acquistare.');
      return;
    }
    
    setLoading(productId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ packageId: productId, type }) 
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore durante la creazione del pagamento.');
      }
      
      const data = await res.json();
      window.location.href = data.url; 
    } catch (err: any) {
      alert(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="mb-12 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link to="/" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-4 block transition-colors">
              ← Torna alla Home
            </Link>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              Mbare Store<span className="text-mbare-accent">.</span>
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4 max-w-2xl">
              Il tuo centro di comando. Supporta la community, sbanca o fatti notare.
            </p>
          </div>
          
          {/* Saldo attuale */}
          {user && (
            <div className="bg-mbare-surface border-2 border-mbare-border px-6 py-4 flex items-center gap-4 shrink-0">
              <span className="text-3xl">🪙</span>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-mbare-muted uppercase">Saldo Attuale</span>
                <span className="font-display font-bold text-2xl text-mbare-accent">{currentBalance}</span>
              </div>
            </div>
          )}
        </div>

        {/* Banner di Stato */}
        {success && (
          <div className="bg-green-500/10 border-2 border-green-500 p-6 mb-10 text-center animate-slide-up">
            <h3 className="text-green-400 font-display font-bold uppercase text-xl mb-1">✅ Pagamento Completato!</h3>
            <p className="text-green-400/80 font-sans text-sm">Le tue Coin o i tuoi articoli sono in fase di accredito.</p>
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-500/10 border-2 border-yellow-500 p-6 mb-10 text-center animate-slide-up">
            <h3 className="text-yellow-400 font-display font-bold uppercase text-xl mb-1">⚠️ Pagamento Annullato</h3>
            <p className="text-yellow-400/80 font-sans text-sm">Nessun addebito è stato effettuato.</p>
          </div>
        )}

        {/* ========================================== */}
        {/* 1. MBARE PRO (ABBONAMENTO) */}
        {/* ========================================== */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-mbare-accent to-orange-500 border-2 border-mbare-accent p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-black text-mbare-accent px-2 py-1 text-xs font-bold uppercase tracking-widest">Novità</span>
                <span className="font-mono text-sm uppercase font-bold text-black">Entrate ricorrenti</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase text-black leading-none mb-4">
                Mbare Pro<span className="text-white">.</span>
              </h2>
              <ul className="text-black font-sans font-medium text-sm space-y-1 mb-6">
                <li>✅ Badge esclusivo "PRO" nel profilo</li>
                <li>✅ +50 Coin gratis ogni mese</li>
                <li>✅ Pubblica annunci senza limiti</li>
                <li>✅ Nome in evidenza nella Bacheca</li>
              </ul>
            </div>

            <div className="relative z-10 shrink-0 text-center bg-black p-6 border-2 border-black w-full md:w-auto">
              <span className="text-4xl font-display font-bold text-mbare-white">2.99€</span>
              <span className="text-xs font-mono text-mbare-muted block mb-4">/ mese</span>
              <button
                onClick={() => handleBuy('pro_subscription', 'subscription')}
                disabled={!!loading}
                className="bg-mbare-accent text-black px-8 py-3 font-bold uppercase tracking-tighter hover:bg-white transition-all w-full border-2 border-mbare-accent hover:border-white disabled:opacity-50"
              >
                {loading === 'pro_subscription' ? '...' : 'Abbonati'}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. RICARICA COIN */}
        {/* ========================================== */}
        <div className="mb-16">
          <h2 className="font-display font-bold uppercase text-2xl text-white mb-6 flex items-center gap-2 border-b-2 border-mbare-border pb-2">
            <span>🪙</span> Ricarica Coin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COIN_PACKAGES.map((pkg) => {
              const totalCoins = pkg.coins + pkg.bonus;
              const isThisLoading = loading === pkg.id;
              
              return (
                <div 
                  key={pkg.id}
                  className={`relative bg-mbare-surface border-2 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    pkg.popular 
                      ? 'border-mbare-accent shadow-[6px_6px_0_0_#ff3b00]' 
                      : 'border-mbare-border hover:border-mbare-white'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mbare-accent text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#fff]">
                      Più Venduto
                    </div>
                  )}
                  
                  <div className="text-center mb-6 border-b border-mbare-border pb-6">
                    <p className="font-display font-bold uppercase text-white text-lg mb-2 flex items-center justify-center gap-2">
                      <span className="text-2xl">{pkg.icon}</span> {pkg.label}
                    </p>
                    <div className="flex items-baseline justify-center gap-2 mt-4">
                      <span className="text-5xl font-display font-bold text-mbare-accent">{totalCoins}</span>
                      <span className="text-2xl text-mbare-white">🪙</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <p className="text-xs font-mono text-green-400 uppercase mt-2 font-bold bg-green-500/10 inline-block px-2 py-1">
                        +{pkg.bonus} bonus inclusi
                      </p>
                    )}
                  </div>

                  <div className="text-center mb-6 mt-auto">
                    <span className="text-3xl font-display font-bold text-white">€{pkg.price.toFixed(2)}</span>
                    <span className="text-[10px] text-mbare-muted font-mono block mt-1">IVA inclusa</span>
                  </div>

                  <button
                    onClick={() => handleBuy(pkg.id, 'coin')}
                    disabled={!!loading}
                    className={`w-full py-3 font-bold uppercase tracking-tighter transition-all flex justify-center items-center gap-2 ${
                      pkg.popular 
                        ? 'bg-mbare-accent text-black hover:bg-white' 
                        : 'bg-mbare-white text-black hover:bg-mbare-accent hover:text-white'
                    } disabled:opacity-50 border-2 border-transparent hover:border-white`}
                  >
                    {isThisLoading ? '...' : 'Acquista'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* 3. NEGOZIO PREMIUM (Cosmetici) */}
        {/* ========================================== */}
        <div className="mb-16">
          <h2 className="font-display font-bold uppercase text-2xl text-white mb-6 flex items-center gap-2 border-b-2 border-mbare-border pb-2">
            <span>✨</span> Potenziamenti & Cosmetici
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PREMIUM_ITEMS.map((item) => {
              const isThisLoading = loading === item.id;
              return (
                <div key={item.id} className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col hover:border-mbare-white transition-all">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-display font-bold uppercase text-white text-lg mb-2">{item.label}</h3>
                  <p className="text-mbare-muted font-sans text-xs mb-6 flex-grow">{item.desc}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-mbare-border">
                    <span className="text-xl font-display font-bold text-mbare-accent">€{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleBuy(item.id, 'item')}
                      disabled={!!loading}
                      className="bg-mbare-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-mbare-accent hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isThisLoading ? '...' : 'Compra'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storico Acquisti */}
        {user && history.length > 0 && (
          <div className="animate-slide-up">
            <h2 className="font-display font-bold uppercase text-2xl text-white mb-4">I Tuoi Acquisti</h2>
            <div className="bg-mbare-surface border-2 border-mbare-border divide-y divide-mbare-border">
              {history.map((item) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-mbare-black/30 transition-colors">
                  <div>
                    <p className="font-display font-bold text-white text-lg">
                      {item.coins > 0 ? `${item.coins} Coin` : 'Articolo Premium'} <span className="text-mbare-accent">🪙</span>
                    </p>
                    <p className="text-xs text-mbare-muted font-mono uppercase mt-1">
                      {new Date(item.created_at || item.createdAt).toLocaleDateString('it-IT', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display font-bold text-white text-xl">
                      €{Number(item.amount_eur || item.amountEur).toFixed(2)}
                    </p>
                    <span className={`text-[10px] font-bold font-mono uppercase px-3 py-1 border-2 ${
                      item.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                      item.status === 'pending' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                      'border-red-500 text-red-500 bg-red-500/10'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}