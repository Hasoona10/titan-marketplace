'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            try {
              // Get user data from Firestore
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({ 
                  id: firebaseUser.uid, 
                  email: firebaseUser.email || '',
                  displayName: userData.displayName || firebaseUser.displayName || '',
                  photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
                  major: userData.major,
                  gradYear: userData.gradYear,
                  bio: userData.bio,
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  updatedAt: userData.updatedAt?.toDate() || new Date(),
                  isAdmin: userData.isAdmin || false,
                  profileComplete: userData.profileComplete || false,
                } as User);
              } else {
                // Create user document if it doesn't exist
                const newUser: User = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || '',
                  photoURL: firebaseUser.photoURL || undefined,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  isAdmin: false,
                  profileComplete: false,
                };
                try {
                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    ...newUser,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                } catch (error) {
                  console.error('Error creating user document:', error);
                }
                setUser(newUser);
              }
            } catch (error) {
              console.error('Error accessing Firestore:', error);
              // Still set user from Firebase Auth even if Firestore fails
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                isAdmin: false,
                profileComplete: false,
              });
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
          clearTimeout(timeout);
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setUser(null);
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      }
      throw new Error('Failed to sign in with Google. Please try again.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
