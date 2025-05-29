// src/types/user.ts
import { BaseEntity, UserRole } from './index';

// Interface para usuário do Firebase Auth
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Interface para dados do usuário no Firestore
export interface User extends BaseEntity {
  email: string;
  nome: string;
  telefone?: string;
  role: UserRole;
  avatar?: string;
  ultimoAcesso?: Date;
  contribuintes: string[]; // Array de contribuintes que o usuário pode acessar
}

// Interface para contexto de autenticação
export interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

// Interface para formulário de login
export interface LoginForm {
  email: string;
  password: string;
}

// Interface para formulário de registro
export interface RegisterForm {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Interface para erros de formulário
export interface FormErrors {
  [key: string]: string | undefined;
}
