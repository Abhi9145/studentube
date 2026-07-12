import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeNRArQqKfawWldXvsm2Rj1Gf7Y_nrL80",
  authDomain: "studentube-7b189.firebaseapp.com",
  projectId: "studentube-7b189",
  storageBucket: "studentube-7b189.firebasestorage.app",
  messagingSenderId: "519818459937",
  appId: "1:519818459937:web:818cb54279e68ca4a01c60",
  measurementId: "G-67WFZYY4RD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);