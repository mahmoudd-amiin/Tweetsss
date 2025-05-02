import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1XrQAmJ4gJTSC9rzM-SdFltRVuCLr29U",
  authDomain: "tweetss-44d50.firebaseapp.com",
  projectId: "tweetss-44d50",
  storageBucket: "tweetss-44d50.firebasestorage.app",
  messagingSenderId: "36186540394",
  appId: "1:36186540394:web:57617eb58d5999828abd13",
  measurementId: "G-61N9W5TNTE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage, ref, uploadBytes, getDownloadURL };