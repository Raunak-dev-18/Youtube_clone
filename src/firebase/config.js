import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC9dXdihe9K6WDz8HyPxuVikFmtZWlrgGc",
  authDomain: "cubervid.firebaseapp.com",
  databaseURL: "https://cubervid-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cubervid",
  storageBucket: "cubervid.firebasestorage.app",
  messagingSenderId: "667787389991",
  appId: "1:667787389991:web:ccd924d03fc00102ebb202"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;