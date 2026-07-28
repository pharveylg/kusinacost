import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { isFirebaseConfigured, firebaseAuth } from './firebase';

export interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(u: User | null): AuthUser | null {
  if (!u) return null;
  return { id: u.uid, email: u.email };
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Mali ang email o password. Please try again.';
    case 'auth/email-already-in-use':
      return 'May account na gamit ang email na ito. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    default:
      return `Something went wrong (${code || 'unknown error'}). Please try again.`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(mapUser(u));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!firebaseAuth) return { error: 'Firebase not configured' };
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      return { error: null };
    } catch (e: any) {
      return { error: friendlyError(e?.code || '') };
    }
  }

  async function signUp(email: string, password: string) {
    if (!firebaseAuth) return { error: 'Firebase not configured' };
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      return { error: null };
    } catch (e: any) {
      return { error: friendlyError(e?.code || '') };
    }
  }

  async function signInWithGoogle() {
    if (!firebaseAuth) return { error: 'Firebase not configured' };
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      return { error: null };
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') {
        return { error: null };
      }
      return { error: friendlyError(e?.code || '') };
    }
  }

  async function signOut() {
    if (!firebaseAuth) return;
    await fbSignOut(firebaseAuth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, configured: isFirebaseConfigured, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
