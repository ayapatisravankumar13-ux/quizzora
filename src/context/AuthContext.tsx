import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, BOOTSTRAP_ADMIN_EMAIL } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminEmail: string | null;
  adminName: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPasskey: (email: string, passkey: string) => Promise<{ success: boolean; error?: string }>;
  signOutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'quizzora_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check saved passkey session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: parsed.email })
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.authorized) {
                setIsAdmin(true);
                setAdminEmail(parsed.email);
                setAdminName(parsed.name || parsed.email.split('@')[0]);
              } else {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        try {
          const res = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
          });
          const data = await res.json();
          const authorized = Boolean(data.authorized) || currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
          if (authorized) {
            setIsAdmin(true);
            setAdminEmail(currentUser.email);
            setAdminName(currentUser.displayName || currentUser.email.split('@')[0]);
          } else {
            setIsAdmin(false);
          }
        } catch {
          const isBootstrap = currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isBootstrap);
          if (isBootstrap) {
            setAdminEmail(currentUser.email);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with Firebase Auth
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user?.email) {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: result.user.email })
        });
        const data = await res.json();
        if (data.authorized || result.user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          setAdminEmail(result.user.email);
          setAdminName(result.user.displayName || result.user.email.split('@')[0]);
        }
      }
    } catch (err) {
      console.error('Google Sign-in failed', err);
      throw err;
    }
  };

  // Mobile-Friendly Coordinator Passkey Sign-In (For all 10 members without popup issues)
  const signInWithPasskey = async (email: string, passkey: string) => {
    try {
      const res = await fetch('/api/admin/login-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passkey })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authorization failed.' };
      }

      setIsAdmin(true);
      setAdminEmail(data.member.email);
      setAdminName(data.member.name || data.member.email.split('@')[0]);

      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
          email: data.member.email,
          name: data.member.name,
          role: data.member.role
        }));
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  };

  const signOutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(null);
    setIsAdmin(false);
    setAdminEmail(null);
    setAdminName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminEmail,
        adminName,
        loading,
        signInWithGoogle,
        signInWithPasskey,
        signOutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
