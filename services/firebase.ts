// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);