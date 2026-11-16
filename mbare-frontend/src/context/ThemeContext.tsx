import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export interface Theme { name: string; label: string; accent: string; accentHover: string; price: number; }
export interface FontOption { name: string; label: string; family: string; preview: string; price: number; }
export interface SizeOption { name: string; label: string; scale: string; price: number; }
export interface RadiusOption { name: string; label: string; radius: string; price: number; }

export const THEMES: Theme[] = [
  { name: 'classico', label: 'Classico', accent: '#ff3b00', accentHover: '#ff5522', price: 0 },
  { name: 'neon', label: 'Neon', accent: '#00ff88', accentHover: '#33ffaa', price: 100 },
  { name: 'viola', label: 'Viola', accent: '#a855f7', accentHover: '#c084fc', price: 150 },
  { name: 'rosa', label: 'Rosa', accent: '#ec4899', accentHover: '#f472b6', price: 150 },
  { name: 'cyberpunk', label: 'Cyberpunk', accent: '#00ddff', accentHover: '#33eeff', price: 200 },
  { name: 'oro', label: 'Oro', accent: '#fbbf24', accentHover: '#fcd34d', price: 500 },
];

export const FONTS: FontOption[] = [
  { name: 'space-grotesk', label: 'Grotesk', family: '"Space Grotesk", sans-serif', preview: 'Aa', price: 0 },
  { name: 'inter', label: 'Inter', family: '"Inter", sans-serif', preview: 'Aa', price: 50 },
  { name: 'mono', label: 'Mono', family: '"Space Mono", monospace', preview: 'Aa', price: 50 },
  { name: 'bebas', label: 'Bebas', family: '"Bebas Neue", sans-serif', preview: 'Aa', price: 100 },
  { name: 'anton', label: 'Anton', family: '"Anton", sans-serif', preview: 'Aa', price: 150 },
  { name: 'playfair', label: 'Playfair', family: '"Playfair Display", serif', preview: 'Aa', price: 200 },
];

export const SIZES: SizeOption[] = [
  { name: 'compact', label: 'Compatta', scale: '0.92', price: 0 },
  { name: 'normal', label: 'Normale', scale: '1', price: 0 },
  { name: 'large', label: 'Grande', scale: '1.1', price: 0 },
];

export const RADIUS_OPTIONS: RadiusOption[] = [
  { name: 'sharp', label: 'Sharp', radius: '0px', price: 0 },
  { name: 'soft', label: 'Soft', radius: '6px', price: 100 },
  { name: 'round', label: 'Round', radius: '14px', price: 200 },
];

interface Unlocked { themes: string[]; fonts: string[]; sizes: string[]; radii: string[]; }

interface Preferences { theme: Theme; font: FontOption; size: SizeOption; radius: string; reduceMotion: boolean; }

interface ThemeContextType {
  preferences: Preferences;
  unlocked: Unlocked;
  setTheme: (theme: Theme) => boolean;
  setFont: (font: FontOption) => boolean;
  setSize: (size: SizeOption) => boolean;
  setRadius: (radius: string) => boolean;
  setReduceMotion: (value: boolean) => void;
  markUnlocked: (type: keyof Unlocked, name: string) => void;
  isUnlocked: (type: keyof Unlocked, name: string) => boolean;
  themes: Theme[];
  fonts: FontOption[];
  sizes: SizeOption[];
  radiusOptions: RadiusOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PREFS_KEY = 'mbare-preferences';
const UNLOCKED_KEY = 'mbare-unlocked';

const defaultUnlocked: Unlocked = {
  themes: THEMES.filter(t => t.price === 0).map(t => t.name),
  fonts: FONTS.filter(f => f.price === 0).map(f => f.name),
  sizes: SIZES.filter(s => s.price === 0).map(s => s.name),
  radii: RADIUS_OPTIONS.filter(r => r.price === 0).map(r => r.name),
};

function loadPreferences(): Preferences {
  const defaults: Preferences = { theme: THEMES[0], font: FONTS[0], size: SIZES[1], radius: '0px', reduceMotion: false };
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return {
        theme: THEMES.find(t => t.name === p.theme?.name) || defaults.theme,
        font: FONTS.find(f => f.name === p.font?.name) || defaults.font,
        size: SIZES.find(s => s.name === p.size?.name) || defaults.size,
        radius: p.radius || defaults.radius,
        reduceMotion: p.reduceMotion ?? false,
      };
    }
  } catch (e) {}
  return defaults;
}

function loadUnlocked(): Unlocked {
  try {
    const saved = localStorage.getItem(UNLOCKED_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return {
        themes: Array.from(new Set([...defaultUnlocked.themes, ...(p.themes || [])])),
        fonts: Array.from(new Set([...defaultUnlocked.fonts, ...(p.fonts || [])])),
        sizes: Array.from(new Set([...defaultUnlocked.sizes, ...(p.sizes || [])])),
        radii: Array.from(new Set([...defaultUnlocked.radii, ...(p.radii || [])])),
      };
    }
  } catch (e) {}
  return defaultUnlocked;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [unlocked, setUnlocked] = useState<Unlocked>(loadUnlocked);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--mbare-accent', preferences.theme.accent);
    root.style.setProperty('--mbare-accent-hover', preferences.theme.accentHover);
    root.style.setProperty('--font-display', preferences.font.family);
    root.style.setProperty('--text-scale', preferences.size.scale);
    root.style.setProperty('--radius-base', preferences.radius);
    root.style.setProperty('--animation-duration', preferences.reduceMotion ? '0s' : '0.3s');
    if (preferences.reduceMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
  }, [unlocked]);

  const isUnlocked = useCallback((type: keyof Unlocked, name: string) => unlocked[type].includes(name), [unlocked]);

  const markUnlocked = useCallback((type: keyof Unlocked, name: string) => {
    setUnlocked(prev => ({ ...prev, [type]: Array.from(new Set([...prev[type], name])) }));
  }, []);

  const setTheme = (theme: Theme) => { if (!isUnlocked('themes', theme.name)) return false; setPreferences(p => ({...p, theme})); return true; };
  const setFont = (font: FontOption) => { if (!isUnlocked('fonts', font.name)) return false; setPreferences(p => ({...p, font})); return true; };
  const setSize = (size: SizeOption) => { setPreferences(p => ({...p, size})); return true; };
  const setRadius = (radius: string) => { const opt = RADIUS_OPTIONS.find(r => r.radius === radius); if (opt && !isUnlocked('radii', opt.name)) return false; setPreferences(p => ({...p, radius})); return true; };
  const setReduceMotion = (reduceMotion: boolean) => setPreferences(p => ({...p, reduceMotion}));

  return (
    <ThemeContext.Provider value={{
      preferences, unlocked, setTheme, setFont, setSize, setRadius, setReduceMotion,
      markUnlocked, isUnlocked, themes: THEMES, fonts: FONTS, sizes: SIZES, radiusOptions: RADIUS_OPTIONS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve essere usato dentro ThemeProvider');
  return ctx;
}