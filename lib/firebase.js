import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA2q_egGUBg5mBQq3YxD1r5N68YIia4V-4",
  authDomain: "zapa-a4aab.firebaseapp.com",
  databaseURL: "https://zapa-a4aab-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zapa-a4aab",
  storageBucket: "zapa-a4aab.firebasestorage.app",
  messagingSenderId: "869177204184",
  appId: "1:869177204184:web:c8ba002198975f11b0e6ad",
  measurementId: "G-FCZM972RX7"
};

const app = initializeApp(firebaseConfig);

const realtimeDB = getDatabase(app);;
export { realtimeDB };
export default app;