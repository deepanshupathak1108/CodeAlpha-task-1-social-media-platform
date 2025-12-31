const API_URL = "http://localhost:5000/api";
const postsDiv = document.getElementById("posts");
const nav = document.getElementById("auth-nav");

function updateNav() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (token && user) {
    nav.innerHTML = `
      <span>Welcome, ${user.username} 👋</span>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <button onclick="location.href='login.html'">Login</button>
      <button onclick="location.href='signup.html'">Signup</button>
    `;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateNav();
  loadPosts();
}

document.getElementById("postBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const content = document.getElementById("postContent").value.trim();
  if (!token) return alert("Please login first!");
  if (!content) return alert("Post cannot be empty!");

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ content })
  });
  if (res.ok) {
    document.getElementById("postContent").value = "";
    loadPosts();
  }
});

async function loadPosts() {
  postsDiv.innerHTML = "<p>Loading posts...</p>";
  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    const user = JSON.parse(localStorage.getItem("user"));
    postsDiv.innerHTML = "";

    for (const post of posts) {
      const liked = user && post.likes.includes(user._id);
      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.innerHTML = `
        <p>${post.content}</p>
        <small>By: ${post.user?.username || "unknown"}</small><br>
        <button class="like-btn ${liked ? "liked" : ""}" onclick="toggleLike('${post._id}', this)">
          ❤️ ${post.likes.length}
        </button>
        <div class="comment-box">
          <input type="text" class="comment-input" placeholder="Write a comment...">
          <button class="comment-btn" onclick="addComment('${post._id}', this)">Comment</button>
          <div class="comments" id="comments-${post._id}"></div>
        </div>
      `;
      postsDiv.appendChild(postDiv);
      loadComments(post._id);
    }
  } catch (err) {
    postsDiv.innerHTML = "<p>Failed to load posts.</p>";
  }
}

async function toggleLike(postId, btn) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login to like posts.");

  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token }
  });
  const data = await res.json();
  if (res.ok) {
    btn.classList.toggle("liked", data.liked);
    btn.innerHTML = `❤️ ${data.likes}`;
  }
}

async function addComment(postId, btn) {
  const input = btn.previousElementSibling;
  const text = input.value.trim();
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first!");
  if (!text) return alert("Comment cannot be empty.");

  const res = await fetch(`${API_URL}/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ text })
  });

  if (res.ok) {
    input.value = "";
    loadComments(postId);
  } else {
    const err = await res.json();
    alert(err.message || "Failed to add comment");
  }
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${API_URL}/comments/${postId}`);
    const data = await res.json();
    const div = document.getElementById(`comments-${postId}`);
    div.innerHTML = data.map(c => `<div class="comment"><b>${c.user?.username || "User"}:</b> ${c.text}</div>`).join("");
  } catch {
    console.log("Error loading comments");
  }
}

updateNav();
loadPosts();

async function createPost() {
  const content = document.getElementById("postContent").value.trim();
  const token = localStorage.getItem("token"); // ✅ get stored token

  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ Send token here
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("postContent").value = "";
      loadPosts(); // refresh posts
    } else {
      alert(data.message || "Error creating post");
    }
  } catch (err) {
    console.error(err);
    alert("Network error while posting");
  }
}