import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function WalletWidget() {
  const { user } = useUser();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stato per l'effetto "Flash" quando arriva una transazione
  const [isFlashing, setIsFlashing] = useState(false);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Eseguiamo le due chiamate in parallelo per velocità
      const [walletRes, txRes] = await Promise.all([
        fetch(`${API_URL}/tokens/wallet`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch(`${API_URL}/tokens/transactions`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (walletRes.ok && txRes.ok) {
        const walletData = await walletRes.json();
        const txData = await txRes.json();
        
        setWallet(walletData);
        // Se il backend restituisce { transactions: [] } o direttamente l'array
        setTransactions(Array.isArray(txData) ? txData : txData.transactions || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();

    if (!user) return;

    // 🔥 REALTIME LISTENER
    const channel = supabase
      .channel(`user-wallet-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
        () => {
          // Attiva l'effetto flash
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 1000);
          fetchWalletData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'token_transactions', filter: `user_id=eq.${user.id}` },
        () => {
          // Ricarica la lista quando arriva una nuova transazione
          fetchWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-mbare-surface border-2 border-mbare-border p-6 animate-pulse h-64 flex flex-col justify-between">
        <div className="w-1/2 h-8 bg-mbare-border"></div>
        <div className="w-1/3 h-16 bg-mbare-border"></div>
        <div className="w-full h-4 bg-mbare-border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500 p-6 text-center">
        <p className="text-red-500 font-mono text-sm uppercase">Errore caricamento wallet</p>
      </div>
    );
  }

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border hover:border-mbare-accent transition-colors duration-300 relative group overflow-hidden">
      
      {/* Sfondo decorativo (Texture) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* HEADER: Saldo */}
      <div className="p-6 border-b-2 border-mbare-border relative z-10 flex justify-between items-start">
        <div>
          <h3 className="font-mono text-xs text-mbare-muted uppercase tracking-widest mb-1">Il Tuo Portafoglio</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl md:text-6xl font-display font-bold transition-all duration-300 ${
              isFlashing ? 'text-green-400 scale-110' : 'text-mbare-white'
            }`}>
              {wallet?.balance || 0}
            </span>
            <span className="text-3xl">🪙</span>
          </div>
          <p className="font-mono text-[10px] text-mbare-muted uppercase mt-2">
            Totale guadagnato: <span className="text-mbare-accent">{wallet?.totalEarned || 0}</span>
          </p>
        </div>
        
        {/* Icona decorativa grande */}
        <div className="opacity-20 group-hover:opacity-40 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
          </svg>
        </div>
      </div>

      {/* BODY: Storico Transazioni */}
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-mono text-xs text-mbare-muted uppercase">Ultimi Movimenti</h4>
          <span className="bg-mbare-black border border-mbare-border text-[10px] px-2 py-0.5 font-mono text-mbare-accent">
            Live
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-mbare-border">
              <p className="text-mbare-muted font-mono text-xs uppercase">Nessuna transazione.</p>
              <p className="text-mbare-border font-sans text-[10px] mt-1">Vai all'Arcade per guadagnare!</p>
            </div>
          ) : (
            transactions.map((t: any) => {
              // Determiniamo il tipo di transazione per l'icona
              const isArcade = t.reason.toLowerCase().includes('arcade');
              const isAdmin = t.reason.toLowerCase().includes('rettifica') || t.reason.toLowerCase().includes('admin');
              const isSpiffy = t.reason.toLowerCase().includes('spiffera') || t.reason.toLowerCase().includes('voto');
              
              return (
                <div 
                  key={t.id} 
                  className="flex justify-between items-center bg-mbare-black border border-mbare-border p-3 hover:border-mbare-white transition-colors group/tx"
                >
                  <div className="flex items-center gap-3">
                    {/* Icona in base al motivo */}
                    <div className="w-8 h-8 flex items-center justify-center bg-mbare-surface border border-mbare-border text-sm">
                      {isArcade ? '🎮' : isAdmin ? '🛡️' : isSpiffy ? '🌶️' : '💸'}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-white font-sans text-xs md:text-sm line-clamp-1">
                        {t.reason}
                      </span>
                      <span className="text-mbare-muted font-mono text-[9px] uppercase mt-0.5">
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`font-mono font-bold text-sm md:text-base px-2 py-1 ${
                    t.amount > 0 
                      ? 'text-green-500 bg-green-500/10' 
                      : 'text-red-500 bg-red-500/10'
                  }`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}