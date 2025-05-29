// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase usando variáveis de ambiente do Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verificar se todas as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não está definida`);
  }
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (apenas em produção)
export const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

// Conectar aos emuladores em desenvolvimento
if (import.meta.env.DEV) {
  try {
    // Conectar ao emulador do Auth
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    
    // Conectar ao emulador do Firestore
    if (!db._delegate._databaseId) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Conectar ao emulador do Storage
    if (!storage._delegate._host) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('🔥 Conectado aos emuladores Firebase');
  } catch (error) {
    console.log('📡 Usando Firebase em produção');
  }
}

// Log da configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Firebase configurado:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MODE
  });
}

export default app;
