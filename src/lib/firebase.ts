import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-2314390627-da844',
  appId: '1:664369753288:web:63060ec2dbd5721d99c9fd',
  storageBucket: 'studio-2314390627-da844.firebasestorage.app',
  apiKey: 'AIzaSyD23Km2yh9y4-i1WoI7_M2xSiXwsY3qCNY',
  authDomain: 'studio-2314390627-da844.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '664369753288',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
