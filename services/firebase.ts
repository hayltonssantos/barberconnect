// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzB54YUmMCG_oPHJxdiG7zgGg9lfdwAqc",
  authDomain: "barberconnect-b676b.firebaseapp.com",
  projectId: "barberconnect-b676b",
  storageBucket: "barberconnect-b676b.appspot.com",
  messagingSenderId: "568063885102",
  appId: "1:568063885102:web:6de10f68f97fa3014744bf",
  measurementId: "G-NLPK2BVTK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (opcional)
if (process.env.NODE_ENV === 'development') {
  // Descomente as linhas abaixo se quiser usar emuladores locais
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;
