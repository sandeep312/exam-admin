import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxPicN-p2j4KPHtwzCcH2yDPTqak-FiJY",
  authDomain: "examify-f2bfd.firebaseapp.com",
  projectId: "examify-f2bfd",
  storageBucket: "examify-f2bfd.firebasestorage.app",
  messagingSenderId: "644357868068",
  appId: "1:644357868068:web:4811edc86ad632316e26b1"
};

// Prevent Firebase re-initialization
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getFirestore(app);
