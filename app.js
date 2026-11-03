const seedPosts = [
  { id: 1, name: "Alex Morgan", initials: "AM", avatar: "avatar-mint", time: "2h ago", image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=900&q=85", caption: "There’s nowhere else I’d rather be on a Tuesday morning. 🌿", likes: 42, comments: [{ name: "Jamie", text: "This looks so peaceful!" }, { name: "Jordan", text: "Adding this to our weekend list." }] },
  { id: 2, name: "Jordan Lee", initials: "JL", avatar: "avatar-peach", time: "5h ago", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=85", caption: "A little sunshine, a good book, and absolutely nowhere to be.", likes: 28, comments: [] }
];

const state = {
  posts: JSON.parse(localStorage.getItem("best-friends-posts") || "null") || seedPosts,
  liked: JSON.parse(localStorage.getItem("best-friends-liked") || "{}"),
  saved: JSON.parse(localStorage.getItem("best-friends-saved") || "{}"),
  profile: JSON.parse(localStorage.getItem("best-friends-profile") || "null")
};
const savedTheme = localStorage.getItem("best-friends-theme") || "light";

const $ = (selector) => document.querySelector(selector);
const postsContainer = $("#posts-container");

function persist() {
  localStorage.setItem("best-friends-posts", JSON.stringify(state.posts));
  localStorage.setItem("best-friends-liked", JSON.stringify(state.liked));
  localStorage.setItem("best-friends-saved", JSON.stringify(state.saved));
}

function initialsFor(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function renderPosts(posts = state.posts) {
  postsContainer.innerHTML = posts.length ? posts.map((post) => `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-head"><span class="avatar ${post.avatar || "avatar-peach"}">${post.initials}</span><div class="post-author"><b>${post.name}</b><small>${post.time}</small></div><button class="post-menu" aria-label="More options">···</button></div>
      <img class="post-image" src="${post.image}" alt="${post.caption || "A shared moment"}" />
      <div class="post-body">
        <div class="post-actions">
          <button class="action-button like-button ${state.liked[post.id] ? "liked" : ""}" data-action="like"><span class="action-icon">${state.liked[post.id] ? "♥" : "♡"}</span><span>${post.likes + (state.liked[post.id] ? 1 : 0)}</span></button>
          <button class="action-button" data-action="focus-comment"><span class="action-icon">◌</span><span>${post.comments.length}</span></button>
          <button class="action-button" data-action="share"><span class="action-icon">↗</span><span>Share</span></button>
          <button class="action-button save-button ${state.saved[post.id] ? "liked" : ""}" data-action="save" style="margin-left:auto"><span class="action-icon">${state.saved[post.id] ? "★" : "☆"}</span></button>
        </div>
        <p class="post-caption"><b>${post.name.split(" ")[0]}</b>${post.caption || ""}</p>
        ${post.comments.length ? `<button class="comments-link" data-action="focus-comment">View all ${post.comments.length} comments</button>` : ""}
        <div class="comments-list">${post.comments.slice(-2).map((comment) => `<p class="comment"><b>${comment.name}</b>${comment.text}</p>`).join("")}</div>
        <form class="comment-form"><input name="comment" placeholder="Add a comment..." aria-label="Add a comment" /><button type="submit">Post</button></form>
      </div>
    </article>
  `).join("") : `<div class="empty-state"><h3>No saved moments yet</h3><p>Tap the star on a post to keep it close.</p></div>`;
}

function showModal(id) { $(`#${id}`).classList.remove("hidden"); }
function hideModal(id) { $(`#${id}`).classList.add("hidden"); }
function toast(message) {
  const element = $("#toast"); element.textContent = message; element.classList.remove("hidden");
  setTimeout(() => element.classList.add("hidden"), 2400);
}
function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("best-friends-theme", theme);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#171514" : "#fffaf5");
  document.querySelectorAll("[data-theme-choice]").forEach((button) => button.classList.toggle("active", button.dataset.themeChoice === theme));
}
function setView(view) {
  const isSettings = view === "settings";
  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $("#settings-panel").classList.toggle("hidden", !isSettings);
  postsContainer.classList.toggle("hidden", isSettings);
  $(".feed-header").classList.toggle("hidden", isSettings);
  $(".stories").classList.toggle("hidden", isSettings);
  $(".feed-tabs").classList.toggle("hidden", isSettings);
  if (!isSettings) renderPosts(view === "saved" ? state.posts.filter((post) => state.saved[post.id]) : state.posts);
}

$("#new-post-button").addEventListener("click", () => showModal("post-modal"));
$("#mobile-new-post").addEventListener("click", () => showModal("post-modal"));
$("#mobile-search-button").addEventListener("click", () => {
  const search = $(".search");
  search.classList.toggle("mobile-search-open");
  if (search.classList.contains("mobile-search-open")) $("#search-input").focus();
});
$("#story-add").addEventListener("click", () => showModal("post-modal"));
$("#profile-button").addEventListener("click", () => state.profile ? toast(`You're signed in as ${state.profile.username}`) : showModal("auth-modal"));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => hideModal(button.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => { if (event.target === backdrop) backdrop.classList.add("hidden"); }));

$("#post-image").addEventListener("change", (event) => {
  const file = event.target.files[0]; if (file) $("#upload-label").textContent = file.name;
});

$("#post-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const file = $("#post-image").files[0];
  if (!file) return toast("Choose a photo before sharing.");
  const reader = new FileReader();
  reader.onload = () => {
    state.posts.unshift({ id: Date.now(), name: state.profile?.name || "Jamie Smith", initials: state.profile?.initials || "JS", avatar: "avatar-peach", time: "Just now", image: reader.result, caption: $("#post-caption").value.trim(), likes: 0, comments: [] });
    persist(); renderPosts(); event.target.reset(); $("#upload-label").textContent = "Choose a photo"; hideModal("post-modal"); toast("Your moment is live ✨");
  };
  reader.readAsDataURL(file);
});

$("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault(); hideModal("auth-modal"); showModal("profile-modal"); toast("Account created — let’s make your profile!");
});
$("#login-switch").addEventListener("click", () => toast("Log in is ready for your email and password."));
$("#profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const first = $("#first-name").value.trim(); const last = $("#last-name").value.trim(); const username = $("#username").value.trim().replace(/^@/, "");
  state.profile = { name: `${first} ${last}`, username: `@${username}`, initials: initialsFor(`${first} ${last}`) };
  localStorage.setItem("best-friends-profile", JSON.stringify(state.profile));
  $("#profile-button").textContent = state.profile.initials;
  hideModal("profile-modal"); toast("Profile saved. Welcome to Best Friends!");
});

postsContainer.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]"); if (!button) return;
  const card = button.closest("[data-post-id]"); const id = Number(card.dataset.postId); const post = state.posts.find((item) => item.id === id);
  if (button.dataset.action === "like") state.liked[id] = !state.liked[id];
  if (button.dataset.action === "save") state.saved[id] = !state.saved[id];
  if (button.dataset.action === "share") { try { await navigator.clipboard.writeText(location.href); toast("Post link copied to your clipboard."); } catch { toast("Post ready to share."); } }
  if (button.dataset.action === "focus-comment") card.querySelector("input").focus();
  persist(); renderPosts();
});

postsContainer.addEventListener("submit", (event) => {
  if (!event.target.matches(".comment-form")) return;
  event.preventDefault(); const input = event.target.comment; const text = input.value.trim(); if (!text) return;
  const post = state.posts.find((item) => item.id === Number(event.target.closest("[data-post-id]").dataset.postId));
  post.comments.push({ name: state.profile?.name?.split(" ")[0] || "Jamie", text }); persist(); renderPosts(); toast("Comment added");
});

$("#search-input").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase().trim();
  renderPosts(state.posts.filter((post) => `${post.name} ${post.caption}`.toLowerCase().includes(query)));
});
document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
document.querySelectorAll("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
document.querySelectorAll(".follow-button").forEach((button) => button.addEventListener("click", () => { button.textContent = button.textContent === "Follow" ? "Following" : "Follow"; toast(button.textContent === "Following" ? "You're now following them." : "Unfollowed"); }));
renderPosts();
setTheme(savedTheme);
if (state.profile) $("#profile-button").textContent = state.profile.initials;
