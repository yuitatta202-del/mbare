import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function CoinTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Stato per il form di aggiustamento token
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: '', reason: '' });
  // Stato per il form broadcast
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCoinData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/super-admin/coins`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/super-admin/coins/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          userId: adjustForm.userId,
          amount: Number(adjustForm.amount),
          reason: adjustForm.reason
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      alert('Token aggiornati con successo!');
      setAdjustForm({ userId: '', amount: '', reason: '' });
      fetchCoinData(); // Ricarica i dati
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Vuoi inviare questa notifica a TUTTI gli utenti?')) return;
    
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/super-admin/coins/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify(broadcastForm)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      alert('Notifica inviata con successo!');
      setBroadcastForm({ title: '', message: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) return <div className="text-mbare-muted font-mono animate-pulse">Caricando i dati sulle Mbare Coin...</div>;

  return (
    <div className="flex flex-col gap-8">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Mbare Coin in Circolazione</span>
          <span className="text-5xl font-display font-bold text-mbare-accent">{data.stats.circulating}</span>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Totale Token Guadagnati (Storico)</span>
          <span className="text-5xl font-display font-bold text-white">{data.stats.totalEarned}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Gestione Token */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <h3 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-2">Rettifica Saldo Utente</h3>
          <form onSubmit={handleAdjust} className="flex flex-col gap-4">
            <input 
              type="text" placeholder="ID Utente (UUID)" 
              value={adjustForm.userId} onChange={e => setAdjustForm({...adjustForm, userId: e.target.value})}
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-mono text-sm" required 
            />
            <input 
              type="number" placeholder="Importo (es. 50 per aggiungere, -50 per togliere)" 
              value={adjustForm.amount} onChange={e => setAdjustForm({...adjustForm, amount: e.target.value})}
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-mono text-sm" required 
            />
            <input 
              type="text" placeholder="Motivo (es. Premio Arcade, Rimborso)" 
              value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})}
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-mono text-sm" 
            />
            <button type="submit" disabled={actionLoading} className="bg-mbare-white text-black font-bold uppercase py-3 hover:bg-mbare-accent hover:text-white transition-colors mt-2">
              {actionLoading ? 'Elaborazione...' : 'Applica Rettifica'}
            </button>
          </form>
        </div>

        {/* Form Broadcast Notifiche */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <h3 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-2">Invia Notifica Globale</h3>
          <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
            <input 
              type="text" placeholder="Titolo della notifica" 
              value={broadcastForm.title} onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})}
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none font-mono text-sm" required 
            />
            <textarea 
              placeholder="Messaggio per tutti gli utenti..." 
              value={broadcastForm.message} onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})}
              className="bg-mbare-black border border-mbare-border text-white p-3 h-24 focus:border-mbare-accent outline-none font-sans" required 
            />
            <button type="submit" disabled={actionLoading} className="bg-mbare-accent text-black font-bold uppercase py-3 hover:bg-white transition-colors mt-2">
              {actionLoading ? 'Invio in corso...' : 'Invia a Tutti'}
            </button>
          </form>
        </div>
      </div>

      {/* Liste (Wallet e Transazioni) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 50 Wallet */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-2">Top 50 Portafogli</h3>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {data.wallets.map((w: any) => (
              <div key={w.userId} className="flex justify-between items-center bg-mbare-black border border-mbare-border p-3">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{w.user?.username || 'Utente Sconosciuto'}</span>
                  <span className="text-mbare-muted font-mono text-[10px]">{w.userId}</span>
                </div>
                <span className="font-mono text-mbare-accent font-bold">{w.balance} 🪙</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ultime Transazioni */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-2">Ultime Transazioni</h3>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {data.recentTransactions.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center bg-mbare-black border border-mbare-border p-3">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{t.user?.username || 'Sconosciuto'}</span>
                  <span className="text-mbare-muted font-sans text-xs">{t.reason}</span>
                </div>
                <span className={`font-mono font-bold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}