import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDl36EJUiT3MbmZEVpNIMrt3pCdJjtKG_o',
  authDomain: 'accessproinnovation-9355c.firebaseapp.com',
  projectId: 'accessproinnovation-9355c',
  storageBucket: 'accessproinnovation-9355c.firebasestorage.app',
  messagingSenderId: '42866075712',
  appId: '1:42866075712:web:97f2de847ccb60641c17a5',
  measurementId: 'G-SRK7KJCLQ5',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
