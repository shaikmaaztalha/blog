import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { 
  addDoc, collection, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { 
  ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const { auth, db, storage } = window.firebaseServices;

// --- Signup ---
window.signup = async function() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    alert("Signed up!");
    localStorage.setItem("uid", userCred.user.uid);
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
};

// --- Login ---
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in!");
    localStorage.setItem("uid", userCred.user.uid);
    window.location.href = "home.html";
  } catch (e) {
    alert(e.message);
  }
};

// --- Create Post ---
window.createPost = async function() {
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("media").files[0];
  const visibility = document.getElementById("visibility").value;
  const uid = localStorage.getItem("uid");

  let mediaUrl = "";
  if (file) {
    const fileRef = ref(storage, "uploads/" + Date.now() + "_" + file.name);
    await uploadBytes(fileRef, file);
    mediaUrl = await getDownloadURL(fileRef);
  }

  await addDoc(collection(db, "posts"), {
    uid, title, desc, visibility, mediaUrl, createdAt: Date.now()
  });

  alert("Post Created!");
  window.location.reload();
};

// --- Fetch Posts ---
window.onload = async function() {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const q1 = query(collection(db, "posts"), where("uid", "==", uid));
  const q2 = query(collection(db, "posts"), where("visibility", "==", "public"));

  const myPostsSnap = await getDocs(q1);
  const publicPostsSnap = await getDocs(q2);

  const myPostsDiv = document.getElementById("myPosts");
  const publicPostsDiv = document.getElementById("publicPosts");

  myPostsSnap.forEach(doc => {
    const p = doc.data();
    myPostsDiv.innerHTML += `<div>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      ${p.mediaUrl ? `<a href="${p.mediaUrl}" target="_blank">View Media</a>` : ""}
    </div>`;
  });

  publicPostsSnap.forEach(doc => {
    const p = doc.data();
    publicPostsDiv.innerHTML += `<div>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      ${p.mediaUrl ? `<a href="${p.mediaUrl}" target="_blank">View Media</a>` : ""}
    </div>`;
  });
};
