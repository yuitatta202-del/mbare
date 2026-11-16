import { useState } from 'react';

interface SpicyMeterProps {
  value: number;
  onChange: (value: number) => void;
}

export function SpicyMeter({ value, onChange }: SpicyMeterProps) {
  // Calcoliamo il colore in base alla percentuale (da Giallo a Rosso)
  // Usiamo HSL: 60 è giallo, 0 è rosso.
  const hue = 60 - (value / 100) * 60;
  const color = `hsl(${hue}, 100%, 50%)`;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <label className="font-mono text-xs text-mbare-muted uppercase">
          Livello Spicy
        </label>
        <span className="font-display font-bold text-2xl" style={{ color }}>
          {value}%
        </span>
      </div>
      
      <div className="relative w-full h-12 flex items-center">
        {/* Sfondo della barra */}
        <div className="absolute left-0 right-0 h-2 bg-mbare-border rounded-full overflow-hidden pointer-events-none">
          <div 
            className="h-full transition-all duration-75"
            style={{ width: `${value}%`, backgroundColor: color }}
          />
        </div>
        
        {/* Input Range (trasparente ma funzionale, sopra la barra) */}
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Pallino animato che segue il cursore */}
        <div 
          className="absolute w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none transition-transform"
          style={{ 
            left: `calc(${value}% - 12px)`,
            border: `3px solid ${color}`
          }}
        />
      </div>
    </div>
  );
}