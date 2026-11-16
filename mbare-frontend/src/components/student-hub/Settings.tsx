import { useTheme } from '../../context/ThemeContext';

export function Settings() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* Header */}
      <div className="border-b-2 border-mbare-border pb-6">
        <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter">
          Personalizza<span className="text-mbare-accent">.</span>
        </h1>
        <p className="text-mbare-muted font-sans text-lg mt-2">
          Fai tua la piattaforma. Scegli il tuo stile preferito.
        </p>
      </div>

      {/* Sezione: Tema Colore */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold uppercase text-2xl text-white">Tema Colore</h2>
          <span className="font-mono text-xs text-mbare-muted uppercase">
            Attivo: <span className="text-mbare-accent">{theme.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((t) => {
            const isActive = t.name === theme.name;
            return (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                className={`group relative bg-mbare-surface border-2 p-4 transition-all hover:-translate-y-1 ${
                  isActive 
                    ? 'border-mbare-accent shadow-[4px_4px_0_0_#fff]' 
                    : 'border-mbare-border hover:border-mbare-white'
                }`}
              >
                {/* Anteprima colore */}
                <div 
                  className="w-full h-16 mb-3 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: t.accent }}
                >
                  {isActive && (
                    <span className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>
                
                {/* Nome tema */}
                <div className="text-center">
                  <p className={`font-display font-bold uppercase text-sm ${isActive ? 'text-mbare-accent' : 'text-white'}`}>
                    {t.label}
                  </p>
                  <p className="font-mono text-[10px] text-mbare-muted mt-1 uppercase">
                    {t.accent}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sezione: Anteprima dal vivo */}
      <div>
        <h2 className="font-display font-bold uppercase text-2xl text-white mb-4">Anteprima dal Vivo</h2>
        
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <p className="text-mbare-muted font-sans mb-4">
            Ecco come apparirà la piattaforma con il tuo tema <strong className="text-mbare-accent">{theme.label}</strong>:
          </p>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Bottone primario */}
            <button className="bg-mbare-accent text-black px-6 py-2 font-bold uppercase text-sm hover:bg-white transition-colors">
              Bottone
            </button>
            
            {/* Badge */}
            <span className="bg-mbare-black text-mbare-accent border-2 border-mbare-accent px-3 py-1 font-mono text-xs uppercase">
              #Tag
            </span>

            {/* Testo accent */}
            <span className="text-mbare-accent font-display font-bold uppercase">
              Testo Accent
            </span>
          </div>

          {/* Card di esempio */}
          <div className="mt-6 border-2 border-mbare-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-mbare-accent text-black flex items-center justify-center font-bold text-xl">
              M
            </div>
            <div>
              <p className="font-display font-bold uppercase text-white">Card di Esempio</p>
              <p className="text-mbare-muted font-sans text-sm">Così appariranno le card con il tuo tema.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione: Info */}
      <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex items-start gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <p className="font-mono text-sm text-mbare-muted uppercase mb-1">Come funziona?</p>
          <p className="font-sans text-mbare-muted text-sm">
            La tua scelta viene salvata automaticamente nel browser. Tornando su Mbare dal tuo solito dispositivo, ritroverai il tuo tema preferito.
          </p>
        </div>
      </div>

    </div>
  );
}