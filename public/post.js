const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

if (postId) {
  db.collection("posts").doc(postId).get().then(doc => {
    if (doc.exists) {
      const post = doc.data();

      document.getElementById("postHeading").innerText = post.title;
      document.getElementById("postDescription").innerText = post.description;

      // Update <title> and <meta> for SEO
      document.title = post.title;
      document.getElementById("metaDescription").setAttribute("content", post.description.substring(0, 150));

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
      document.getElementById("postMedia").innerHTML = mediaHtml;
    } else {
      document.body.innerHTML = "<h2>Post not found</h2>";
    }
  });
}
