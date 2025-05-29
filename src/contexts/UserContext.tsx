// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'; // ✅ Importar diretamente
import { auth } from '@/services/firebase'; // ✅ Importar auth diretamente
import { AuthService } from '@/services/authService';
import type { User, AuthContextType } from '@/types';

const UserContext = createContext<AuthContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ USAR onAuthStateChanged DIRETAMENTE DO FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userData = await AuthService.getUserData(firebaseUser.uid);
          setUserData(userData);
        } catch (err) {
          console.error('Erro ao carregar dados do usuário:', err);
          setError('Erro ao carregar dados do usuário');
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Cleanup function
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const firebaseUser = await AuthService.signIn(email, password);
      const userData = await AuthService.getUserData(firebaseUser.uid);
      
      setUser(firebaseUser);
      setUserData(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const firebaseUser = await AuthService.signUp(email, password, nome);
      const userData = await AuthService.getUserData(firebaseUser.uid);
      
      setUser(firebaseUser);
      setUserData(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.signOut();
      setUser(null);
      setUserData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer logout';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);

    try {
      await AuthService.resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um UserProvider');
  }
  return context;
};

export { UserContext };
