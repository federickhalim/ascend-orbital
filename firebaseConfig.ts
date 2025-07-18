import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU",
  authDomain: "ascend-da29b.firebaseapp.com",
  projectId: "ascend-da29b",
  storageBucket: "ascend-da29b.appspot.com", 
  messagingSenderId: "49912877452",
  appId: "1:49912877452:web:eede40b2ebbf0bb27586a9",
  measurementId: "G-L80J85QMS2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, app, storage };
