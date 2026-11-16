import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Se passiamo sopra un bottone o un link, ingrandiamo il cursore
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Cursore principale */}
      <div
        className="fixed top-0 left-0 w-4 h-4 bg-mbare-white rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x - 8}px, ${position.y - 8}px) scale(${isHovering ? 2.5 : 1})`,
        }}
      />
      {/* Alone luminoso che segue con un po' di ritardo */}
      <div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-mbare-accent rounded-full pointer-events-none z-[99] transition-all duration-300 ease-out opacity-50"
        style={{
          transform: `translate(${position.x - 20}px, ${position.y - 20}px) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(255, 59, 0, 0.1)' : 'transparent',
        }}
      />
    </>
  );
}
