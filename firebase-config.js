// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqT5zeFffY24gmEUaD58XI-R3i9BiE51s",
  authDomain: "blog-app-ce64d.firebaseapp.com",
  projectId: "blog-app-ce64d",
  storageBucket: "blog-app-ce64d.firebasestorage.app",
  messagingSenderId: "795445924522",
  appId: "1:795445924522:web:a6c5d25c3e986ec2beb6d3"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

