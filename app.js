const API = "http://localhost:5000/api";

async function createPost() {
  const content = document.getElementById("postContent").value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first!");
    return;
  }

  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ content }),
  });

  if (res.ok) {
    document.getElementById("postContent").value = "";
    alert("✅ Post created!");
    loadPosts();
  } else {
    const error = await res.json();
    alert("❌ Failed to post: " + (error.message || "Unknown error"));
  }
}

async function loadPosts() {
  const res = await fetch(`${API}/posts`);
  const posts = await res.json();

  const feed = document.getElementById("feed");
  feed.innerHTML = posts.map(p => `
    <div class="post">
      <h3>${p.user?.username || "Anonymous"}</h3>
      <p>${p.content}</p>
      <button onclick="likePost('${p._id}')">❤️ ${p.likes.length}</button>
    </div>
  `).join("");
}

async function likePost(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first!");
    return;
  }

  await fetch(`${API}/posts/${id}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  });
  loadPosts();
}

loadPosts();
