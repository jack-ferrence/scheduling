// managers the current user's identity across the whole app

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { registerUser, getStoredUserId, getStoredUserName } from '../lib/api';

type UserState = {
  userId: string | null;
  userName: string;
  loading: boolean;
};

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const existing = getStoredUserId();
      const storedName = getStoredUserName();
      if (existing) {
        if (!cancelled) {
          setUserId(existing);
          if (storedName) setUserName(storedName);
        }
        setLoading(false);
        return;
      }

      try {
        const name = storedName?.trim() || 'Guest';
        const u = await registerUser(name);
        if (!cancelled) {
          localStorage.setItem('biola_user_id', u.id);
          localStorage.setItem('biola_user_name', u.name);
          setUserId(u.id);
          setUserName(u.name);
        }
      } catch (e) {
        console.error('Failed to register user', e);
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{ userId, userName, loading }}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserState {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
