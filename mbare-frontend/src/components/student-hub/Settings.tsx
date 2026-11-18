
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function Settings() {
  const {
    preferences,
    themes,
    fonts,
    sizes,
    radiusOptions,
    setTheme,
    setFont,
    setSize,
    setRadius,
    setReduceMotion,
    isUnlocked
  } = useTheme();

  const {
    theme,
    font,
    size,
    radius,
    reduceMotion
  } = preferences;

  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
  };

  const handleReset = () => {
    const defaultTheme = themes.find(t => t.name === 'classico');
    const defaultFont = fonts.find(f => f.name === 'space-grotesk');
    const defaultSize = sizes.find(s => s.name === 'normal');
    const defaultRadius = radiusOptions.find(r => r.name === 'sharp');

    if (defaultTheme) setTheme(defaultTheme);
    if (defaultFont) setFont(defaultFont);
    if (defaultSize) setSize(defaultSize);
    if (defaultRadius) setRadius(defaultRadius.radius);

    setReduceMotion(false);
    showNotice('Preferenze predefinite ripristinate!');
  };

  return (
    <div className="flex flex-col gap-10 animate-slide-up">

      {/* HEADER */}
      <header className="border-b-2 border-mbare-border pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-mbare-accent">
              MBARE / PERSONALIZZAZIONE
            </span>

            <h1 className="mt-3 text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-mbare-white">
              Il tuo stile<span className="text-mbare-accent">.</span>
            </h1>

            <p className="text-mbare-muted mt-3 text-sm md:text-base max-w-xl">
              Personalizza colori, caratteri, dimensioni e animazioni.
              Rendi MBARE davvero tuo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="border-2 border-mbare-border px-5 py-3 font-mono text-xs uppercase font-bold text-mbare-white hover:border-mbare-accent hover:text-mbare-accent transition-colors"
          >
            Ripristina
          </button>
        </div>
      </header>

      {/* FEEDBACK */}
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 border border-mbare-accent bg-mbare-surface px-5 py-4"
        >
          <p className="text-sm font-mono text-mbare-accent">
            {notice}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Chiudi messaggio"
            className="text-mbare-muted hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==========================================
          TEMI COLORE
      ========================================== */}
      <section>
        <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
          <div>
            <h2 className="font-display font-bold uppercase text-2xl text-mbare-white">
              Temi colore
            </h2>
            <p className="font-mono text-xs text-mbare-muted mt-1">
              Scegli il colore principale della piattaforma
            </p>
          </div>

          <span className="font-mono text-xs text-mbare-muted uppercase">
            Attivo:{' '}
            <strong className="text-mbare-accent">
              {theme.label}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map(t => {
            const active = t.name === theme.name;
            const unlocked = isUnlocked('themes', t.name);

            return (
              <button
                key={t.name}
                type="button"
                aria-pressed={active}
                disabled={!unlocked}
                onClick={() => {
                  if (setTheme(t)) {
                    showNotice(`Tema ${t.label} applicato!`);
                  }
                }}
                className={`relative text-left group bg-mbare-surface border-2 p-4 transition-all ${
                  active
                    ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]'
                    : 'border-mbare-border'
                } ${
                  unlocked
                    ? 'hover:border-mbare-white hover:-translate-y-1 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className="h-20 flex items-center justify-center mb-4"
                  style={{ backgroundColor: t.accent }}
                >
                  {active && (
                    <span className="bg-black text-white h-9 w-9 flex items-center justify-center font-bold text-xl">
                      ✓
                    </span>
                  )}

                  {!unlocked && (
                    <span className="bg-black/80 text-white font-mono text-xs px-3 py-2">
                      🔒
                    </span>
                  )}
                </div>

                <p className="font-display font-bold uppercase text-mbare-white">
                  {t.label}
                </p>

                <div className="mt-2 flex justify-between items-center gap-2">
                  <span className="text-[10px] font-mono text-mbare-muted">
                    {t.accent}
                  </span>

                  <span className="text-[10px] font-mono font-bold text-mbare-accent">
                    {unlocked
                      ? active ? 'ATTIVO' : 'SBLOCCATO'
                      : `${t.price} COIN`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-mbare-muted mt-3">
          I temi bloccati richiedono uno sblocco tramite il sistema
          Mbare Coin.
        </p>
      </section>

      {/* ==========================================
          CARATTERI
      ========================================== */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-mbare-white mb-2">
          Tipografia
        </h2>

        <p className="font-mono text-xs text-mbare-muted mb-5">
          Scegli il carattere che rappresenta il tuo stile
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fonts.map(f => {
            const active = f.name === font.name;
            const unlocked = isUnlocked('fonts', f.name);

            return (
              <button
                key={f.name}
                type="button"
                disabled={!unlocked}
                aria-pressed={active}
                onClick={() => {
                  if (setFont(f)) {
                    showNotice(`Font ${f.label} applicato!`);
                  }
                }}
                className={`bg-mbare-surface border-2 p-5 text-left transition-colors ${
                  active
                    ? 'border-mbare-accent'
                    : 'border-mbare-border'
                } ${
                  unlocked
                    ? 'hover:border-mbare-white'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className="text-4xl text-mbare-white mb-5"
                  style={{ fontFamily: f.family }}
                >
                  {f.preview}
                </div>

                <p className="text-sm font-bold text-mbare-white uppercase">
                  {f.label}
                </p>

                <p className="mt-2 text-xs font-mono text-mbare-accent">
                  {unlocked
                    ? active ? '✓ Attivo' : 'Disponibile'
                    : `🔒 ${f.price} Coin`}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          DIMENSIONI
      ========================================== */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-mbare-white mb-5">
          Dimensione interfaccia
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sizes.map(s => {
            const active = s.name === size.name;
            const unlocked = isUnlocked('sizes', s.name);

            return (
              <button
                key={s.name}
                type="button"
                disabled={!unlocked}
                aria-pressed={active}
                onClick={() => {
                  if (setSize(s)) {
                    showNotice(`Dimensione ${s.label} applicata!`);
                  }
                }}
                className={`border-2 p-5 text-left bg-mbare-surface ${
                  active
                    ? 'border-mbare-accent'
                    : 'border-mbare-border'
                } ${
                  unlocked
                    ? 'hover:border-mbare-white'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <p className="font-bold uppercase text-mbare-white">
                  {s.label}
                </p>
                <p className="font-mono text-xs text-mbare-muted mt-2">
                  Scala {s.scale}x
                </p>
                {active && (
                  <span className="text-mbare-accent text-xs font-bold">
                    ✓ Attiva
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          BORDI
      ========================================== */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-mbare-white mb-5">
          Stile dei bordi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {radiusOptions.map(r => {
            const active = r.radius === radius;
            const unlocked = isUnlocked('radii', r.name);

            return (
              <button
                key={r.name}
                type="button"
                disabled={!unlocked}
                aria-pressed={active}
                onClick={() => {
                  if (setRadius(r.radius)) {
                    showNotice(`Stile ${r.label} applicato!`);
                  }
                }}
                className={`bg-mbare-surface border-2 p-5 transition-colors ${
                  active
                    ? 'border-mbare-accent'
                    : 'border-mbare-border'
                } ${
                  unlocked
                    ? 'hover:border-mbare-white'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className="w-16 h-12 mx-auto border-4 border-mbare-accent bg-mbare-black mb-4"
                  style={{ borderRadius: r.radius }}
                />

                <p className="font-bold uppercase text-sm text-mbare-white">
                  {r.label}
                </p>

                <p className="text-xs font-mono text-mbare-accent mt-2">
                  {unlocked
                    ? active ? '✓ Attivo' : 'Disponibile'
                    : `🔒 ${r.price} Coin`}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          ACCESSIBILITÀ
      ========================================== */}
      <section className="bg-mbare-surface border-2 border-mbare-border p-6">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h2 className="font-display font-bold uppercase text-xl text-mbare-white">
              Riduci animazioni
            </h2>

            <p className="text-sm text-mbare-muted mt-2">
              Riduce gli effetti di movimento per un'esperienza
              più confortevole.
            </p>
          </div>

          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={event =>
              setReduceMotion(event.target.checked)
            }
            aria-label="Riduci animazioni"
            className="h-6 w-6 accent-orange-500 cursor-pointer"
          />
        </div>
      </section>

      {/* ==========================================
          ANTEPRIMA
      ========================================== */}
      <section>
        <h2 className="font-display font-bold uppercase text-2xl text-mbare-white mb-5">
          Anteprima dal vivo
        </h2>

        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <p className="text-mbare-muted text-sm mb-6">
            Il tuo tema attivo è{' '}
            <strong className="text-mbare-accent">
              {theme.label}
            </strong>.
            Le modifiche sono applicate automaticamente.
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            <span className="bg-mbare-accent text-black px-6 py-3 font-bold uppercase text-xs">
              Bottone primario
            </span>

            <span className="bg-mbare-black text-mbare-accent border-2 border-mbare-accent px-4 py-2 font-mono text-xs uppercase">
              #MBARE
            </span>

            <span className="text-mbare-accent font-display font-bold uppercase">
              Testo Accent
            </span>
          </div>

          <div
            className="mt-7 border-2 border-mbare-border p-5 flex items-center gap-4"
            style={{ borderRadius: radius }}
          >
            <div
              className="w-14 h-14 bg-mbare-accent text-black flex items-center justify-center font-bold text-2xl"
              style={{ borderRadius: radius }}
            >
              M
            </div>

            <div>
              <p className="font-display font-bold uppercase text-mbare-white">
                La tua MBARE Card
              </p>

              <p className="text-sm text-mbare-muted mt-1">
                Un'anteprima del tuo stile personale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFO */}
      <footer className="border-t border-mbare-border pt-6">
        <p className="font-mono text-xs text-mbare-muted leading-relaxed">
          Le preferenze vengono salvate nel browser.
          I contenuti premium rimangono bloccati finché
          non vengono sbloccati dal sistema dedicato.
        </p>
      </footer>
    </div>
  );
}

export default Settings;
