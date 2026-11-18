
import { useId } from 'react';

interface SpicyMeterProps {
  value: number;
  onChange: (value: number) => void;
}

// ==========================================
// MBARE - SPICY METER
// ==========================================

export function SpicyMeter({
  value,
  onChange
}: SpicyMeterProps) {

  const inputId = useId();

  // Garantisce un valore tra 1 e 100.
  const safeValue = Number.isFinite(value)
    ? Math.min(100, Math.max(1, value))
    : 50;

  // Da giallo (60°) a rosso (0°).
  const hue = 60 - (safeValue / 100) * 60;

  const color = `hsl(${hue}, 100%, 50%)`;

  // Posizione corretta del pallino lungo la barra.
  const thumbPosition =
    ((safeValue - 1) / 99) * 100;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = Number(event.target.value);

    if (Number.isFinite(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">

      {/* HEADER */}
      <div className="flex justify-between items-end gap-4">

        <label
          htmlFor={inputId}
          className="font-mono text-xs text-mbare-muted uppercase tracking-wider"
        >
          Livello Spicy
        </label>

        <span
          className="font-display font-bold text-2xl tabular-nums"
          style={{ color }}
          aria-hidden="true"
        >
          {Math.round(safeValue)}%
        </span>
      </div>

      {/* SLIDER */}
      <div className="relative w-full h-12 flex items-center">

        {/* Barra di sfondo */}
        <div
          className="absolute inset-x-0 h-2 bg-mbare-border rounded-full overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-full transition-all duration-100 ease-out"
            style={{
              width: `${thumbPosition}%`,
              backgroundColor: color
            }}
          />
        </div>

        {/* Input accessibile */}
        <input
          id={inputId}
          type="range"
          min={1}
          max={100}
          step={1}
          value={safeValue}
          onChange={handleChange}
          aria-valuetext={`${Math.round(safeValue)} per cento`}
          className="
            absolute inset-0
            w-full h-full
            opacity-0
            cursor-pointer
            z-10
            focus-visible:opacity-100
            focus-visible:accent-orange-500
          "
        />

        {/* Indicatore animato */}
        <div
          className="
            absolute
            w-6 h-6
            rounded-full
            bg-white
            shadow-[0_0_15px_rgba(255,255,255,0.5)]
            pointer-events-none
            transition-all duration-100 ease-out
          "
          style={{
            left: `calc(${thumbPosition}% - ${thumbPosition * 0.24}px)`,
            transform: 'translateX(-0%)',
            border: `3px solid ${color}`
          }}
          aria-hidden="true"
        />
      </div>

      {/* INDICATORI */}
      <div className="flex justify-between items-center text-[10px] font-mono uppercase text-mbare-muted">
        <span>🌶️ Leggero</span>
        <span>🔥 Bollente</span>
      </div>
    </div>
  );
}

export default SpicyMeter;
