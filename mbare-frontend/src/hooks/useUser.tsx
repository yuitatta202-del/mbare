// src/hooks/useUser.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
// FIX: aggiunto 'type' per evitare che Vite lo cerchi a runtime
import type { User } from '@supabase/supabase-js';

// Definiamo i tipi per non usare 'any'
interface UserContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

// Creiamo il Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Funzione di supporto per estrarre il ruolo in modo sicuro dal JWT
const extractRoleFromJWT = (accessToken: string): string => {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.user_role || 'USER';
  } catch (e) {
    console.error("Errore nel parsing del JWT", e);
    return 'USER';
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Controlla se c'è già una sessione attiva
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setRole(session ? extractRoleFromJWT(session.access_token) : null);
        setLoading(false);
      }
    });

    // 2. Ascolta i cambiamenti (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setRole(session ? extractRoleFromJWT(session.access_token) : null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook per consumare il context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve essere usato all'interno di un UserProvider");
  }
  return context;
}