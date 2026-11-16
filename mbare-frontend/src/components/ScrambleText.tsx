import { useEffect, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function ScrambleText({ text, className }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const animate = () => {
      interval = setInterval(() => {
        setDisplayText((prev) =>
          prev
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3; // Velocità dell'animazione
      }, 30);
    };

    animate();
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}