import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type UnlockCategory = 'themes' | 'fonts' | 'sizes' | 'radii';
interface ConfirmingState { category: UnlockCategory; name: string; label: string; price: number; }

export function Settings() {
  const { user } = useUser();
  const { preferences, setTheme, setFont, setSize, setRadius, setReduceMotion, markUnlocked, isUnlocked, themes, fonts, sizes, radiusOptions } = useTheme();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<ConfirmingState | null>(null);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success'|'error', msg: string}|null>(null);

  const fetchBalance = async () => {
    if (!user) { setBalance(0); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/tokens/wallet`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) { const data = await res.json(); setBalance(data.balance ?? 0); }
    } catch { setBalance(0); }
  };

  useEffect(() => { fetchBalance(); }, [user]);
  useEffect(() => { if (feedback) { const t = setTimeout(() => setFeedback(null), 5000); return () => clearTimeout(t); } }, [feedback]);

  const handleOptionClick = (category: UnlockCategory, name: string, label: string, price: number, applyFn: () => void) => {
    if (price === 0 || isUnlocked(category, name)) { applyFn(); return; }
    if (!user) { setFeedback({ type: 'error', msg: 'Devi essere loggato per sbloccare questa personalizzazione.' }); return; }
    setConfirming({ category, name, label, price });
  };

  const confirmPurchase = async () => {
    if (!confirming) return;
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/tokens/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ amount: confirming.price, reason: `Sblocco personalizzazione: ${confirming.label}` })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Errore durante l\'acquisto'); }
      
      markUnlocked(confirming.category, confirming.name);
      if (confirming.category === 'themes') { const t = themes.find(x => x.name === confirming.name); if (t) setTheme(t); }
      else if (confirming.category === 'fonts') { const f = fonts.find(x => x.name === confirming.name); if (f) setFont(f); }
      else if (confirming.category === 'radii') { const r = radiusOptions.find(x => x.name === confirming.name); if (r) setRadius(r.radius); }
      
      setFeedback({ type: 'success', msg: `${confirming.label} sbloccato con successo!` });
      setConfirming(null);
      fetchBalance();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Errore durante il pagamento.' });
    } finally { setProcessing(false); }
  };

  const renderPriceTag = (price: number) => {
    if (price === 0) return <span className="text-[10px] font-mono text-green-500 uppercase">Gratis</span>;
    return <span className="text-[10px] font-mono text-mbare-accent uppercase font-bold">{price} 🪙</span>;
  };

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      {/* Header con saldo */}
      <div className="border-b-2 border-mbare-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">Personalizza<span className="text-mbare-accent">.</span></h1>
          <p className="text-mbare-muted font-sans text-lg mt-2">Sblocca stili premium con le tue Mbare Coin.</p>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border px-4 py-3 flex items-center gap-3 shrink-0">
          <span className="text-2xl">🪙</span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-mbare-muted uppercase">Saldo</span>
            <span className="font-display font-bold text-xl text-mbare-accent">{balance === null ? '...' : balance}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 text-sm font-sans border-l-4 animate-slide-up ${feedback.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Tema Colore */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-white mb-4">🎨 Tema Colore</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isActive = t.name === preferences.theme.name;
            const isLocked = !isUnlocked('themes', t.name);
            return (
              <button key={t.name} onClick={() => handleOptionClick('themes', t.name, t.label, t.price, () => setTheme(t))} disabled={processing}
                className={`group relative bg-mbare-surface border-2 p-3 transition-all hover:-translate-y-1 flex flex-col ${isActive ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]' : isLocked ? 'border-mbare-border opacity-75 hover:opacity-100' : 'border-mbare-border hover:border-mbare-white'}`}>
                <div className="w-full h-12 mb-2 flex items-center justify-center relative" style={{ backgroundColor: t.accent }}>
                  {isActive && <span className="bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-xs">✓</span>}
                  {isLocked && <span className="text-2xl">🔒</span>}
                </div>
                <div className="flex justify-between items-center">
                  <p className={`font-display font-bold uppercase text-xs ${isActive ? 'text-mbare-accent' : 'text-white'}`}>{t.label}</p>
                  {renderPriceTag(t.price)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Font */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-white mb-4">🔤 Stile Font</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {fonts.map((f) => {
            const isActive = f.name === preferences.font.name;
            const isLocked = !isUnlocked('fonts', f.name);
            return (
              <button key={f.name} onClick={() => handleOptionClick('fonts', f.name, f.label, f.price, () => setFont(f))} disabled={processing}
                className={`group relative bg-mbare-surface border-2 p-3 transition-all hover:-translate-y-1 flex flex-col items-center ${isActive ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]' : isLocked ? 'border-mbare-border opacity-75 hover:opacity-100' : 'border-mbare-border hover:border-mbare-white'}`}>
                <span className="text-4xl mb-1 text-white relative" style={{ fontFamily: f.family }}>
                  {f.preview}
                  {isLocked && <span className="absolute -top-2 -right-2 text-sm">🔒</span>}
                </span>
                <div className="flex justify-between items-center w-full mt-1">
                  <p className={`font-mono uppercase text-[10px] ${isActive ? 'text-mbare-accent' : 'text-mbare-muted'}`}>{f.label}</p>
                  {renderPriceTag(f.price)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dimensione (sempre gratis) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold uppercase text-2xl text-white">📏 Dimensione Testo</h2>
          <span className="font-mono text-[10px] text-green-500 uppercase">Accessibilità - Gratis</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s) => {
            const isActive = s.name === preferences.size.name;
            return (
              <button key={s.name} onClick={() => setSize(s)}
                className={`bg-mbare-surface border-2 p-4 transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${isActive ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]' : 'border-mbare-border hover:border-mbare-white'}`}>
                <span className={`font-display font-bold ${isActive ? 'text-mbare-accent' : 'text-white'}`} style={{ fontSize: `calc(1.5rem * ${s.scale})` }}>Aa</span>
                <p className={`font-mono uppercase text-[10px] ${isActive ? 'text-mbare-accent' : 'text-mbare-muted'}`}>{s.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Angoli */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-white mb-4">⬛ Angoli</h2>
        <div className="grid grid-cols-3 gap-3">
          {radiusOptions.map((r) => {
            const isActive = r.radius === preferences.radius;
            const isLocked = !isUnlocked('radii', r.name);
            return (
              <button key={r.name} onClick={() => handleOptionClick('radii', r.name, r.label, r.price, () => setRadius(r.radius))} disabled={processing}
                className={`bg-mbare-surface border-2 p-4 transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${isActive ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]' : isLocked ? 'border-mbare-border opacity-75 hover:opacity-100' : 'border-mbare-border hover:border-mbare-white'}`}>
                <div className={`w-12 h-12 ${isActive ? 'bg-mbare-accent' : 'bg-mbare-border'} relative`} style={{ borderRadius: r.radius }}>
                  {isLocked && <span className="absolute inset-0 flex items-center justify-center text-lg">🔒</span>}
                </div>
                <div className="flex flex-col items-center">
                  <p className={`font-mono uppercase text-[10px] ${isActive ? 'text-mbare-accent' : 'text-mbare-muted'}`}>{r.label}</p>
                  {renderPriceTag(r.price)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accessibilità */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold uppercase text-2xl text-white">♿ Accessibilità</h2>
          <span className="font-mono text-[10px] text-green-500 uppercase">Gratis</span>
        </div>
        <button onClick={() => setReduceMotion(!preferences.reduceMotion)}
          className={`w-full flex items-center justify-between bg-mbare-surface border-2 p-4 transition-colors ${preferences.reduceMotion ? 'border-mbare-accent' : 'border-mbare-border hover:border-mbare-white'}`}>
          <div className="text-left">
            <p className="font-display font-bold uppercase text-white">Riduci Animazioni</p>
            <p className="text-mbare-muted font-sans text-sm">Disattiva gli effetti di movimento.</p>
          </div>
          <div className={`w-12 h-6 flex items-center border-2 transition-colors shrink-0 ${preferences.reduceMotion ? 'bg-mbare-accent border-mbare-accent justify-end' : 'bg-mbare-border border-mbare-border justify-start'}`}>
            <div className={`w-4 h-4 m-0.5 ${preferences.reduceMotion ? 'bg-black' : 'bg-mbare-muted'}`}></div>
          </div>
        </button>
      </section>

      {/* Info */}
      <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex items-start gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <p className="font-mono text-sm text-mbare-muted uppercase mb-1">Come funziona?</p>
          <p className="font-sans text-mbare-muted text-sm">
            Gli stili base sono gratuiti. Le personalizzazioni premium si sbloccano pagando con le Mbare Coin che guadagni interagendo con la piattaforma (Arcade, Spiffere, News, ecc.). Una volta sbloccate, sono tue per sempre.
          </p>
        </div>
      </div>

      {/* Modal di conferma acquisto */}
      {confirming && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-mbare-surface border-2 border-mbare-accent p-6 max-w-md w-full shadow-[8px_8px_0_0_#ff3b00] animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display font-bold uppercase text-xl text-white">Sblocca {confirming.label}</h3>
              <button onClick={() => setConfirming(null)} disabled={processing} className="text-mbare-muted hover:text-red-500 text-2xl leading-none">✕</button>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-mbare-muted uppercase">Costo</span>
                <span className="text-mbare-accent font-bold">{confirming.price} 🪙</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-mbare-muted uppercase">Saldo attuale</span>
                <span className="text-white font-bold">{balance ?? 0} 🪙</span>
              </div>
              <div className="flex justify-between font-mono text-sm border-t border-mbare-border pt-2">
                <span className="text-mbare-muted uppercase">Dopo l'acquisto</span>
                <span className={`font-bold ${(balance ?? 0) - confirming.price < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {(balance ?? 0) - confirming.price} 🪙
                </span>
              </div>
            </div>
            
            {(balance ?? 0) < confirming.price && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-400 font-sans">
                ⚠️ Non hai abbastanza Mbare Coin. Guadagnale giocando all'Arcade o scrivendo Spiffere!
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} disabled={processing}
                className="flex-1 border-2 border-mbare-border text-mbare-muted font-bold uppercase py-3 hover:border-white hover:text-white transition-colors disabled:opacity-50">
                Annulla
              </button>
              <button onClick={confirmPurchase} disabled={processing || (balance ?? 0) < confirming.price}
                className="flex-1 bg-mbare-accent text-black font-bold uppercase py-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {processing ? 'Pagamento...' : `Sblocca (${confirming.price} 🪙)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}