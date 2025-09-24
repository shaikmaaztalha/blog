// Authentication
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return db.collection("users").doc(userCredential.user.uid).set({
        name: name,
        email: email
      });
    })
    .then(() => {
      alert("Signup successful!");
      window.location = "dashboard.html";
    })
    .catch((error) => alert(error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location = "dashboard.html";
    })
    .catch((error) => alert(error.message));
}

// Blog Post Creation
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
    loadPosts();
  });
}

// Load posts for logged-in user
function loadPosts() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("posts").where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
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
      document.getElementById("posts").innerHTML = html;
    });
}

// Run loadPosts on dashboard load
if (window.location.pathname.includes("dashboard.html")) {
  auth.onAuthStateChanged(user => {
    if (user) loadPosts();
    else window.location = "index.html";
  });
}
