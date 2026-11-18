
import { useEffect, useState } from 'react';

// ==========================================
// MBARE - SCRAMBLE TEXT ANIMATION
// React + Vite + TypeScript
// ==========================================

interface ScrambleTextProps {
  text: string;
  className?: string;
}

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

const INTERVAL_MS = 30;
const REVEAL_STEP = 1 / 3;

export function ScrambleText({
  text,
  className = ''
}: ScrambleTextProps) {

  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;

    // window.setInterval restituisce un number
    // nel browser, senza usare NodeJS.Timeout.
    const interval = window.setInterval(() => {

      setDisplayText(
        text
          .split('')
          .map((_, index) => {

            // Mostra i caratteri originali
            // progressivamente.
            if (index < iteration) {
              return text[index];
            }

            // Mantiene gli spazi leggibili.
            if (text[index] === ' ') {
              return ' ';
            }

            // Sostituisce gli altri caratteri
            // con simboli casuali.
            const randomIndex = Math.floor(
              Math.random() * CHARS.length
            );

            return CHARS[randomIndex];
          })
          .join('')
      );

      iteration += REVEAL_STEP;

      // Termina l'animazione.
      if (iteration >= text.length) {
        window.clearInterval(interval);
        setDisplayText(text);
      }

    }, INTERVAL_MS);

    // Cleanup quando il componente viene smontato
    // oppure cambia la proprietà text.
    return () => {
      window.clearInterval(interval);
    };

  }, [text]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}

export default ScrambleText;
