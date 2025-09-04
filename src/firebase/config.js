import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "_______",
  authDomain: "________",
  databaseURL: "____________",
  projectId: "_______",
  storageBucket: "________",
  messagingSenderId: "___________",
  appId: "___________"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
