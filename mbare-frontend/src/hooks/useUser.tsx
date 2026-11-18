
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

// ==========================================
// MBARE - USER AUTH CONTEXT
// React + Vite + Supabase
// ==========================================

type UserRole =
  | 'USER'
  | 'STUDENT'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface UserContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

interface UserProviderProps {
  children: ReactNode;
}

const VALID_ROLES: readonly UserRole[] = [
  'USER',
  'STUDENT',
  'MODERATOR',
  'ADMIN',
  'SUPER_ADMIN'
];

// ==========================================
// CONTEXT
// ==========================================

const UserContext = createContext<
  UserContextType | undefined
>(undefined);

// ==========================================
// JWT HELPERS
// ==========================================

/**
 * Decodifica il payload JWT.
 *
 * ATTENZIONE:
 * La decodifica serve soltanto a mostrare
 * informazioni nel frontend.
 *
 * Le autorizzazioni vere devono essere
 * verificate dal backend.
 */
function decodeJWTPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      '='
    );

    const decoded = atob(padded);
    const payload: unknown = JSON.parse(decoded);

    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return null;
    }

    return payload as Record<string, unknown>;

  } catch {
    return null;
  }
}

/**
 * Estrae il ruolo applicativo.
 *
 * Non confonde il ruolo Supabase "authenticated"
 * con i ruoli applicativi di MBARE.
 */
function extractRoleFromJWT(
  accessToken: string
): UserRole {
  const payload = decodeJWTPayload(accessToken);

  const rawRole =
    payload?.user_role ??
    (
      typeof payload?.app_metadata === 'object' &&
      payload.app_metadata !== null &&
      'user_role' in payload.app_metadata
        ? payload.app_metadata.user_role
        : undefined
    );

  if (
    typeof rawRole === 'string' &&
    VALID_ROLES.includes(rawRole as UserRole)
  ) {
    return rawRole as UserRole;
  }

  return 'USER';
}

// ==========================================
// AUTH STATE HELPERS
// ==========================================

function getAuthState(session: Session | null): {
  user: User | null;
  role: UserRole | null;
} {
  if (!session) {
    return {
      user: null,
      role: null
    };
  }

  return {
    user: session.user,
    role: extractRoleFromJWT(session.access_token)
  };
}

// ==========================================
// USER PROVIDER
// ==========================================

export function UserProvider({
  children
}: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [role, setRole] = useState<UserRole | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = (session: Session | null) => {
      if (!active) return;

      const state = getAuthState(session);

      setUser(state.user);
      setRole(state.role);
      setLoading(false);
    };

    // ========================================
    // 1. SUBSCRIPTION AUTH
    // ========================================

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      }
    );

    // ========================================
    // 2. RECUPERO SESSIONE INIZIALE
    // ========================================

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error(
            '[MBARE AUTH] Errore recupero sessione:',
            error.message
          );

          applySession(null);
          return;
        }

        applySession(data.session);
      })
      .catch(error => {
        if (!active) return;

        console.error(
          '[MBARE AUTH] Errore imprevisto:',
          error
        );

        applySession(null);
      });

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue = useMemo<UserContextType>(
    () => ({
      user,
      role,
      loading
    }),
    [user, role, loading]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      'useUser deve essere utilizzato all’interno di UserProvider.'
    );
  }

  return context;
}

export default UserProvider;
