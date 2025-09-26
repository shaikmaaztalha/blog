// -------- Signup --------
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Save only email in Firestore
      return db.collection("users").doc(userCredential.user.uid).set({
        email: email
      });
    })
    .then(() => {
      alert("Signup successful!");
      window.location = "dashboard.html";
    })
    .catch((error) => alert(error.message));
}

// -------- Login --------
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location = "dashboard.html";
    })
    .catch((error) => alert(error.message));
}

// -------- Create Blog Post --------
function createPost() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
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
    title: title,
    description: description,
    mediaUrl: mediaUrl,
    isPublic: isPublic,
    userId: userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Post created!");
    showMyPosts(); // refresh my posts immediately
  });
}

// -------- Load My Posts --------
function showMyPosts() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("posts").where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      renderPosts(snapshot, "posts");
    });
}

// -------- Load Discover Posts --------
// -------- Real-time Discover Feed --------
let discoverUnsubscribe = null; // store unsubscribe function to stop listening if needed

function showDiscover() {
  const user = auth.currentUser;
  if (!user) return;

  // If we already have a listener, detach it before creating a new one
  if (discoverUnsubscribe) {
    discoverUnsubscribe();
  }

  // Firestore query: all public posts ordered by createdAt descending
  const query = db.collection("posts")
    .where("isPublic", "==", true)
    .orderBy("createdAt", "desc");

  // Listen in real-time
  discoverUnsubscribe = query.onSnapshot(snapshot => {
    // Filter out the current user's posts
    const filteredDocs = snapshot.docs.filter(doc => doc.data().userId !== user.uid);

    let html = "";
    filteredDocs.forEach(doc => {
      const post = doc.data();
      html += `
        <div class="post">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          ${post.mediaUrl ? `<a href="${post.mediaUrl}" target="_blank">View Media</a>` : ""}
          <p>Public: ${post.isPublic}</p>
        </div>
      `;
    });

    document.getElementById("posts").innerHTML = html || "<p>No public posts yet.</p>";
  }, error => {
    console.error("Error loading discover feed:", error);
  });
}


// -------- Helper: Render Posts --------
function renderPosts(snapshot, containerId) {
  let html = "";
  snapshot.forEach(doc => {
    const post = doc.data();
    html += `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        ${post.mediaUrl ? `<a href="${post.mediaUrl}" target="_blank">View Media</a>` : ""}
        <p>Public: ${post.isPublic}</p>
      </div>
    `;
  });
  document.getElementById(containerId).innerHTML = html || "<p>No posts found.</p>";
}

// -------- Logout --------
function logout() {
  auth.signOut().then(() => {
    window.location = "index.html";
  });
}

// -------- Auth State Listener --------
if (window.location.pathname.includes("dashboard.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("userEmail").innerText = user.email;
      showMyPosts(); // default: show my posts on load
    } else {
      window.location = "index.html";
    }
  });
}
