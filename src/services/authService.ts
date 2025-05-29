// src/services/authService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole } from '@/types';

export class AuthService {
  // Fazer login
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Atualizar último acesso
      await this.updateLastAccess(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Criar conta
  static async signUp(
    email: string, 
    password: string, 
    nome: string,
    role: UserRole = 'admin'
  ): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar perfil do Firebase Auth
      await updateProfile(user, {
        displayName: nome
      });

      // Criar documento do usuário no Firestore
      const userData: Omit<User, 'id'> = {
        email,
        nome,
        role,
        contribuintes: [],
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };

      await setDoc(doc(db, 'usuarios', user.uid), {
        ...userData,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });

      return user;
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Fazer logout
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Resetar senha
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Buscar dados do usuário
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  // Atualizar dados do usuário
  static async updateUserData(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'usuarios', uid), {
        ...updates,
        atualizadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  }

  // Atualizar último acesso
  static async updateLastAccess(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'usuarios', uid), {
        ultimoAcesso: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
    }
  }

  // Verificar se usuário tem acesso ao contribuinte
  static async checkUserAccess(uid: string, contribuinte: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(uid);
      
      if (!userData) return false;
      
      // Verificar se o usuário tem acesso ao contribuinte
      return userData.contribuintes.includes(contribuinte);
    } catch (error) {
      console.error('Erro ao verificar acesso do usuário:', error);
      return false;
    }
  }

  // Adicionar contribuinte ao usuário
  static async addContribuinteToUser(uid: string, contribuinte: string): Promise<void> {
    try {
      const userData = await this.getUserData(uid);
      
      if (userData && !userData.contribuintes.includes(contribuinte)) {
        const updatedContribuintes = [...userData.contribuintes, contribuinte];
        
        await updateDoc(doc(db, 'usuarios', uid), {
          contribuintes: updatedContribuintes,
          atualizadoEm: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar contribuinte ao usuário:', error);
      throw error;
    }
  }

  // Observar mudanças no estado de autenticação
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Tratar erros de autenticação
  private static handleAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este email já está sendo usado',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Conta desabilitada',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/invalid-credential': 'Credenciais inválidas'
    };

    const message = errorMessages[error.code] || error.message || 'Erro de autenticação';
    return new Error(message);
  }
}
