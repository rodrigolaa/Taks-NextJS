import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAnlCfqHtRTuz4sq9NyVobgsnnNgAVoRvg",
  authDomain: "taskwebapp-f4e43.firebaseapp.com",
  projectId: "taskwebapp-f4e43",
  storageBucket: "taskwebapp-f4e43.appspot.com",
  messagingSenderId: "88736190683",
  appId: "1:88736190683:web:d1a36d146b5c5032fe3cfe",
  measurementId: "G-V58J5JEEJ7"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

// const analytics = getAnalytics(firebaseApp);

export default db ;