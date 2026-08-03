import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../firebase/config';
import { getEmployeeProfile } from '../services/authService';
import type { Employee } from '../types';

type AuthContextValue = {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        if (!currentUser) {
          setEmployee(null);
          return;
        }

        try {
          const profile = await getEmployeeProfile(currentUser);
          if (auth.currentUser?.uid === currentUser.uid) {
            setEmployee(profile);
          }
        } catch (error) {
          console.error('Failed to load employee profile', error);
          if (auth.currentUser?.uid === currentUser.uid) {
            setEmployee(null);
          }
        }
      },
      (error) => {
        console.error('Failed to resolve auth state', error);
        setUser(null);
        setEmployee(null);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, employee, loading }), [user, employee, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
