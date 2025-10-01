// -------- Signup --------
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return db.collection("users").doc(userCredential.user.uid).set({ email });
    })
    .then(() => {
      alert("Signup successful!");
      window.location = "dashboard.html";
    })
    .catch(error => alert(error.message));
}

// -------- Login --------
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location = "dashboard.html")
    .catch(error => alert(error.message));
}

// -------- Create Blog Post --------
function createPost() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const isPublic = document.getElementById("isPublic").checked;
  const mediaFile = document.getElementById("media").files[0];

  const user = auth.currentUser;
  if (!user) {
    alert("Login first!");
    return;
  }

  let mediaUrl = "";

  if (mediaFile) {
    const storageRef = storage.ref("posts/" + Date.now() + "-" + mediaFile.name);
    storageRef.put(mediaFile).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        mediaUrl = url;
        savePost(title, description, isPublic, mediaUrl, user.uid);
      });
    });
  } else {
    savePost(title, description, isPublic, mediaUrl, user.uid);
  }
}

function savePost(title, description, isPublic, mediaUrl, userId) {
  db.collection("posts").add({
    title,
    description,
    mediaUrl,
    isPublic,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Post created!");
    showMyPosts();
  });
}

// -------- Load My Posts --------
function showMyPosts() {
  const user = auth.currentUser;
  if (!user) return;

  document.getElementById("postSectionTitle").innerText = "My Posts";

  db.collection("posts")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => renderPosts(snapshot, "posts"));
}

// -------- Load Discover Posts (Realtime) --------
let discoverUnsubscribe = null;

function showDiscover() {
  const user = auth.currentUser;
  if (!user) return;

  document.getElementById("postSectionTitle").innerText = "Discover";

  if (discoverUnsubscribe) discoverUnsubscribe();

  const query = db.collection("posts")
    .where("isPublic", "==", true)
    .orderBy("createdAt", "desc");

  discoverUnsubscribe = query.onSnapshot(snapshot => {
    const filteredDocs = snapshot.docs.filter(doc => doc.data().userId !== user.uid);
    renderPosts(filteredDocs, "posts", true);
  }, error => console.error("Error loading discover feed:", error));
}

function renderPosts(snapshot, containerId, isDocsArray = false) {
  let html = "";
  const docs = isDocsArray ? snapshot : snapshot.docs;

  docs.forEach(doc => {
    const post = doc.data();
    const id = doc.id; // Firestore document ID

    html += `
      <div class="post">
        <h3><a href="post.html?id=${id}">${post.title}</a></h3>
        <p>${post.description.substring(0, 100)}...</p>
      </div>
    `;
  });

  document.getElementById(containerId).innerHTML = html || "<p>No posts found.</p>";
}


// -------- Open Post in New Page --------
function openPostPage(postId) {
  window.location = `post.html?id=${postId}`;
}


// -------- Full Post Modal --------
function openPostModal(postStr) {
  const post = JSON.parse(unescapeHtml(postStr));
  document.getElementById("modalTitle").innerText = post.title;
  document.getElementById("modalDescription").innerText = post.description;

  let mediaHtml = "";
  if (post.mediaUrl) {
    if (post.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
      mediaHtml = `<img src="${post.mediaUrl}" alt="Image">`;
    } else if (post.mediaUrl.match(/\.(mp4|webm)$/i)) {
      mediaHtml = `<video controls src="${post.mediaUrl}"></video>`;
    } else if (post.mediaUrl.match(/\.(mp3|wav)$/i)) {
      mediaHtml = `<audio controls src="${post.mediaUrl}"></audio>`;
    } else {
      mediaHtml = `<a href="${post.mediaUrl}" target="_blank">View Media</a>`;
    }
  }
  document.getElementById("modalMedia").innerHTML = mediaHtml;

  document.getElementById("postModal").style.display = "block";
}

function closeModal() {
  document.getElementById("postModal").style.display = "none";
}

// -------- Logout --------
function logout() {
  auth.signOut().then(() => window.location = "index.html");
}

// -------- Auth State Listener --------
if (window.location.pathname.includes("dashboard.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("userEmail").innerText = user.email;
      showMyPosts();
    } else {
      window.location = "index.html";
    }
  });
}

// -------- Helpers --------
function escapeHtml(text) {
  return text.replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function unescapeHtml(text) {
  return text.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}
