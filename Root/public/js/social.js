const postList = document.getElementById("postList");
const pagination = document.getElementById("pagination");
let currentPage = 1;
const postsPerPage = 10;

// Load posts when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});

async function loadPosts() {
  try {
    const response = await fetch(`/api/posts?page=${currentPage}&limit=${postsPerPage}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error loading posts:', data.error);
      return;
    }
    
    renderPosts(data.posts);
    renderPagination(data.pages);
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

async function addPost() {
  const username = document.getElementById("username").value;
  const title = document.getElementById("title").value;
  const message = document.getElementById("message").value;
  
  if (!username || !title || !message) {
    alert("Please fill in all fields.");
    return;
  }
  
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, title, message })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error adding post:', data.error);
      alert('Failed to add post. Please try again.');
      return;
    }
    
    // Clear form fields
    document.getElementById("username").value = "";
    document.getElementById("title").value = "";
    document.getElementById("message").value = "";
    
    // Reload posts (go to first page to see the new post)
    currentPage = 1;
    loadPosts();
  } catch (error) {
    console.error('Error adding post:', error);
    alert('Failed to add post. Please try again.');
  }
}

// Function to like a post
async function likePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error liking post:', data.error);
      return;
    }
    
    // Update likes count in the UI
    const likeCount = document.querySelector(`#post-${postId} .like-count`);
    if (likeCount) {
      likeCount.textContent = data.likes;
    }
  } catch (error) {
    console.error('Error liking post:', error);
  }
}

// Function to add a comment to a post
async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const comment = input.value.trim();
  
  if (!comment) {
    return;
  }
  
  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error adding comment:', data.error);
      return;
    }
    
    // Clear comment input
    input.value = '';
    
    // Reload posts to show the new comment
    loadPosts();
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Function to render posts in the UI
function renderPosts(posts) {
  postList.innerHTML = "";
  
  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.id = `post-${post.id}`;
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p class="meta">Posted by <b>${post.username}</b> on ${new Date(post.timestamp).toLocaleString()}</p>
      <p>${post.message}</p>
      <p><span class="like-btn" onclick="likePost(${post.id})">Like</span> <span class="like-count">${post.likes}</span></p>
      <div class="comment-section">
        <input type="text" id="comment-input-${post.id}" placeholder="Add a comment..." style="width: 100%;">
        <button onclick="addComment(${post.id})">Comment</button>
        ${post.comments.map(comment => `<div class="comment">${comment}</div>`).join('')}
      </div>
    `;
    postList.appendChild(postDiv);
  });
}

// Function to render pagination controls
function renderPagination(totalPages) {
  pagination.innerHTML = "";
  
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      loadPosts();
    };
    if (i === currentPage) btn.style.fontWeight = "bold";
    pagination.appendChild(btn);
  }
}