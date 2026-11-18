
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react';

import type { ReactNode } from 'react';

// ==========================================
// MBARE — THEME SYSTEM PRO
// React + Vite + TypeScript
// ==========================================

// ==========================================
// TYPES
// ==========================================

export interface Theme {
  name: string;
  label: string;
  accent: string;
  accentHover: string;
  price: number;
}

export interface FontOption {
  name: string;
  label: string;
  family: string;
  preview: string;
  price: number;
}

export interface SizeOption {
  name: string;
  label: string;
  scale: string;
  price: number;
}

export interface RadiusOption {
  name: string;
  label: string;
  radius: string;
  price: number;
}

export interface Unlocked {
  themes: string[];
  fonts: string[];
  sizes: string[];
  radii: string[];
}

export interface Preferences {
  theme: Theme;
  font: FontOption;
  size: SizeOption;
  radius: string;
  reduceMotion: boolean;
}

export interface ThemeContextType {
  preferences: Preferences;
  unlocked: Unlocked;

  setTheme: (theme: Theme) => boolean;
  setFont: (font: FontOption) => boolean;
  setSize: (size: SizeOption) => boolean;
  setRadius: (radius: string) => boolean;
  setReduceMotion: (value: boolean) => void;

  markUnlocked: (
    type: keyof Unlocked,
    name: string
  ) => void;

  isUnlocked: (
    type: keyof Unlocked,
    name: string
  ) => boolean;

  resetPreferences: () => void;

  themes: Theme[];
  fonts: FontOption[];
  sizes: SizeOption[];
  radiusOptions: RadiusOption[];
}

// ==========================================
// CONFIGURAZIONE TEMI
// ==========================================

export const THEMES: Theme[] = [
  {
    name: 'classico',
    label: 'Classico',
    accent: '#ff3b00',
    accentHover: '#ff5522',
    price: 0
  },
  {
    name: 'neon',
    label: 'Neon',
    accent: '#00ff88',
    accentHover: '#33ffaa',
    price: 100
  },
  {
    name: 'viola',
    label: 'Viola',
    accent: '#a855f7',
    accentHover: '#c084fc',
    price: 150
  },
  {
    name: 'rosa',
    label: 'Rosa',
    accent: '#ec4899',
    accentHover: '#f472b6',
    price: 150
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    accent: '#00ddff',
    accentHover: '#33eeff',
    price: 200
  },
  {
    name: 'oro',
    label: 'Oro',
    accent: '#fbbf24',
    accentHover: '#fcd34d',
    price: 500
  }
];

// ==========================================
// CONFIGURAZIONE FONT
// ==========================================

export const FONTS: FontOption[] = [
  {
    name: 'space-grotesk',
    label: 'Grotesk',
    family: '"Space Grotesk", sans-serif',
    preview: 'Aa',
    price: 0
  },
  {
    name: 'inter',
    label: 'Inter',
    family: '"Inter", sans-serif',
    preview: 'Aa',
    price: 50
  },
  {
    name: 'mono',
    label: 'Mono',
    family: '"Space Mono", monospace',
    preview: 'Aa',
    price: 50
  },
  {
    name: 'bebas',
    label: 'Bebas',
    family: '"Bebas Neue", sans-serif',
    preview: 'Aa',
    price: 100
  },
  {
    name: 'anton',
    label: 'Anton',
    family: '"Anton", sans-serif',
    preview: 'Aa',
    price: 150
  },
  {
    name: 'playfair',
    label: 'Playfair',
    family: '"Playfair Display", serif',
    preview: 'Aa',
    price: 200
  }
];

// ==========================================
// DIMENSIONI INTERFACCIA
// ==========================================

export const SIZES: SizeOption[] = [
  {
    name: 'compact',
    label: 'Compatta',
    scale: '0.92',
    price: 0
  },
  {
    name: 'normal',
    label: 'Normale',
    scale: '1',
    price: 0
  },
  {
    name: 'large',
    label: 'Grande',
    scale: '1.1',
    price: 0
  }
];

// ==========================================
// STILI BORDI
// ==========================================

export const RADIUS_OPTIONS: RadiusOption[] = [
  {
    name: 'sharp',
    label: 'Sharp',
    radius: '0px',
    price: 0
  },
  {
    name: 'soft',
    label: 'Soft',
    radius: '6px',
    price: 100
  },
  {
    name: 'round',
    label: 'Round',
    radius: '14px',
    price: 200
  }
];

// ==========================================
// STORAGE KEYS
// ==========================================

const PREFS_KEY = 'mbare-preferences';
const UNLOCKED_KEY = 'mbare-unlocked';

// ==========================================
// DEFAULT VALUES
// ==========================================

const DEFAULT_PREFERENCES: Preferences = {
  theme: THEMES[0],
  font: FONTS[0],
  size: SIZES[1],
  radius: RADIUS_OPTIONS[0].radius,
  reduceMotion: false
};

const DEFAULT_UNLOCKED: Unlocked = {
  themes: THEMES
    .filter(item => item.price === 0)
    .map(item => item.name),

  fonts: FONTS
    .filter(item => item.price === 0)
    .map(item => item.name),

  sizes: SIZES
    .filter(item => item.price === 0)
    .map(item => item.name),

  radii: RADIUS_OPTIONS
    .filter(item => item.price === 0)
    .map(item => item.name)
};

// ==========================================
// STORAGE HELPERS
// ==========================================

function readStorage(key: string): unknown {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(key);

    return saved ? JSON.parse(saved) as unknown : null;
  } catch {
    return null;
  }
}

function writeStorage(
  key: string,
  value: unknown
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Storage non disponibile o spazio esaurito.
    // Il tema continua a funzionare in memoria.
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getSavedName(value: unknown): string | null {
  if (!isRecord(value)) return null;

  return typeof value.name === 'string'
    ? value.name
    : null;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === 'string'
  );
}

// ==========================================
// LOAD UNLOCKED
// ==========================================

function loadUnlocked(): Unlocked {
  const saved = readStorage(UNLOCKED_KEY);

  if (!isRecord(saved)) {
    return {
      ...DEFAULT_UNLOCKED
    };
  }

  const mergeAllowed = (
    defaults: string[],
    incoming: unknown,
    allowed: string[]
  ): string[] => {
    const values = [
      ...defaults,
      ...getStringArray(incoming)
    ];

    return Array.from(
      new Set(
        values.filter(name =>
          allowed.includes(name)
        )
      )
    );
  };

  return {
    themes: mergeAllowed(
      DEFAULT_UNLOCKED.themes,
      saved.themes,
      THEMES.map(t => t.name)
    ),

    fonts: mergeAllowed(
      DEFAULT_UNLOCKED.fonts,
      saved.fonts,
      FONTS.map(f => f.name)
    ),

    sizes: mergeAllowed(
      DEFAULT_UNLOCKED.sizes,
      saved.sizes,
      SIZES.map(s => s.name)
    ),

    radii: mergeAllowed(
      DEFAULT_UNLOCKED.radii,
      saved.radii,
      RADIUS_OPTIONS.map(r => r.name)
    )
  };
}

// ==========================================
// LOAD PREFERENCES
// ==========================================

function loadPreferences(): Preferences {
  const saved = readStorage(PREFS_KEY);
  const unlocked = loadUnlocked();

  if (!isRecord(saved)) {
    return { ...DEFAULT_PREFERENCES };
  }

  const themeName = getSavedName(saved.theme);
  const fontName = getSavedName(saved.font);
  const sizeName = getSavedName(saved.size);

  const savedTheme = THEMES.find(
    t =>
      t.name === themeName &&
      unlocked.themes.includes(t.name)
  );

  const savedFont = FONTS.find(
    f =>
      f.name === fontName &&
      unlocked.fonts.includes(f.name)
  );

  const savedSize = SIZES.find(
    s =>
      s.name === sizeName &&
      unlocked.sizes.includes(s.name)
  );

  const savedRadius = RADIUS_OPTIONS.find(
    r =>
      r.radius === saved.radius &&
      unlocked.radii.includes(r.name)
  );

  return {
    theme: savedTheme ?? DEFAULT_PREFERENCES.theme,
    font: savedFont ?? DEFAULT_PREFERENCES.font,
    size: savedSize ?? DEFAULT_PREFERENCES.size,

    radius:
      savedRadius?.radius ??
      DEFAULT_PREFERENCES.radius,

    reduceMotion:
      typeof saved.reduceMotion === 'boolean'
        ? saved.reduceMotion
        : false
  };
}

// ==========================================
// CONTEXT
// ==========================================

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export function ThemeProvider({
  children
}: {
  children: ReactNode;
}) {

  const [preferences, setPreferences] =
    useState<Preferences>(loadPreferences);

  const [unlocked, setUnlocked] =
    useState<Unlocked>(loadUnlocked);

  // ========================================
  // APPLY THEME TO DOCUMENT
  // ========================================

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      '--mbare-accent',
      preferences.theme.accent
    );

    root.style.setProperty(
      '--mbare-accent-hover',
      preferences.theme.accentHover
    );

    root.style.setProperty(
      '--font-display',
      preferences.font.family
    );

    root.style.setProperty(
      '--text-scale',
      preferences.size.scale
    );

    root.style.setProperty(
      '--radius-base',
      preferences.radius
    );

    root.style.setProperty(
      '--animation-duration',
      preferences.reduceMotion ? '0s' : '0.3s'
    );

    root.classList.toggle(
      'reduce-motion',
      preferences.reduceMotion
    );

    writeStorage(
      PREFS_KEY,
      preferences
    );

  }, [preferences]);

  // ========================================
  // SAVE UNLOCKED
  // ========================================

  useEffect(() => {
    writeStorage(
      UNLOCKED_KEY,
      unlocked
    );
  }, [unlocked]);

  // ========================================
  // CHECK UNLOCKED
  // ========================================

  const isUnlocked = useCallback(
    (
      type: keyof Unlocked,
      name: string
    ): boolean => {
      return unlocked[type].includes(name);
    },
    [unlocked]
  );

  // ========================================
  // MARK UNLOCKED
  // ========================================

  const markUnlocked = useCallback(
    (
      type: keyof Unlocked,
      name: string
    ): void => {

      const allowedNames: Record<
        keyof Unlocked,
        string[]
      > = {
        themes: THEMES.map(t => t.name),
        fonts: FONTS.map(f => f.name),
        sizes: SIZES.map(s => s.name),
        radii: RADIUS_OPTIONS.map(r => r.name)
      };

      if (!allowedNames[type].includes(name)) {
        return;
      }

      setUnlocked(previous => {
        if (previous[type].includes(name)) {
          return previous;
        }

        return {
          ...previous,
          [type]: [
            ...previous[type],
            name
          ]
        };
      });
    },
    []
  );

  // ========================================
  // SET THEME
  // ========================================

  const setTheme = useCallback(
    (theme: Theme): boolean => {
      const selected = THEMES.find(
        t => t.name === theme?.name
      );

      if (
        !selected ||
        !isUnlocked('themes', selected.name)
      ) {
        return false;
      }

      setPreferences(previous => ({
        ...previous,
        theme: selected
      }));

      return true;
    },
    [isUnlocked]
  );

  // ========================================
  // SET FONT
  // ========================================

  const setFont = useCallback(
    (font: FontOption): boolean => {
      const selected = FONTS.find(
        f => f.name === font?.name
      );

      if (
        !selected ||
        !isUnlocked('fonts', selected.name)
      ) {
        return false;
      }

      setPreferences(previous => ({
        ...previous,
        font: selected
      }));

      return true;
    },
    [isUnlocked]
  );

  // ========================================
  // SET SIZE
  // ========================================

  const setSize = useCallback(
    (size: SizeOption): boolean => {
      const selected = SIZES.find(
        s => s.name === size?.name
      );

      if (
        !selected ||
        !isUnlocked('sizes', selected.name)
      ) {
        return false;
      }

      setPreferences(previous => ({
        ...previous,
        size: selected
      }));

      return true;
    },
    [isUnlocked]
  );

  // ========================================
  // SET RADIUS
  // ========================================

  const setRadius = useCallback(
    (radius: string): boolean => {
      const selected = RADIUS_OPTIONS.find(
        r => r.radius === radius
      );

      if (
        !selected ||
        !isUnlocked('radii', selected.name)
      ) {
        return false;
      }

      setPreferences(previous => ({
        ...previous,
        radius: selected.radius
      }));

      return true;
    },
    [isUnlocked]
  );

  // ========================================
  // REDUCE MOTION
  // ========================================

  const setReduceMotion = useCallback(
    (value: boolean): void => {
      setPreferences(previous => ({
        ...previous,
        reduceMotion: Boolean(value)
      }));
    },
    []
  );

  // ========================================
  // RESET
  // ========================================

  const resetPreferences = useCallback((): void => {
    setPreferences({
      ...DEFAULT_PREFERENCES
    });
  }, []);

  // ========================================
  // MEMOIZED CONTEXT
  // ========================================

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      preferences,
      unlocked,

      setTheme,
      setFont,
      setSize,
      setRadius,
      setReduceMotion,

      markUnlocked,
      isUnlocked,
      resetPreferences,

      themes: THEMES,
      fonts: FONTS,
      sizes: SIZES,
      radiusOptions: RADIUS_OPTIONS
    }),
    [
      preferences,
      unlocked,
      setTheme,
      setFont,
      setSize,
      setRadius,
      setReduceMotion,
      markUnlocked,
      isUnlocked,
      resetPreferences
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme deve essere utilizzato dentro ThemeProvider.'
    );
  }

  return context;
}

export default ThemeProvider;
