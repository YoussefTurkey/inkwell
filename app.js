const API = "https://jsonplaceholder.typicode.com";
const PAGE_SIZE = 9;
const COVERS = [
  "from-[#E4572E] to-[#F2A65A]",
  "from-[#2E86AB] to-[#7FC8F8]",
  "from-[#3D9970] to-[#9BE7C4]",
  "from-[#6C4AB6] to-[#B9A6F2]",
  "from-[#D1495B] to-[#F6A6B2]",
];

// ---------- State ----------
let posts = [];
let users = {};
let visible = PAGE_SIZE;

// ---------- Elements ----------
const grid = document.querySelector("#grid");
const count = document.querySelector("#count");
const message = document.querySelector("#message");
const searchInput = document.querySelector("#search");
const authorSelect = document.querySelector("#author");
const sortSelect = document.querySelector("#sort");
const moreBtn = document.querySelector("#moreBtn");
const clearBtn = document.querySelector("#clearBtn");
const modal = document.querySelector("#modal");

// ---------- Helpers ----------
async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const coverFor = (id) => COVERS[id % COVERS.length];
const readTime = (text) => Math.max(1, Math.round(text.split(" ").length / 40));

function initials(name) {
  return name.split(" ").filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
}

// ---------- Theme ----------
document.querySelector("#themeBtn").addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

document.querySelector("#menuBtn").addEventListener("click", () => {
  document.querySelector("#mobileMenu").classList.toggle("hidden");
  document.querySelector("#mobileMenu").classList.toggle("flex");
});

// ---------- Rendering ----------
function showSkeletons() {
  grid.innerHTML = Array.from({ length: 6 }, () => `
    <div class="rounded-card border border-line dark:border-night-line bg-card dark:bg-night-card overflow-hidden animate-pulse">
      <div class="h-36 bg-line dark:bg-night-line"></div>
      <div class="p-5 space-y-3">
        <div class="h-3 w-1/3 rounded bg-line dark:bg-night-line"></div>
        <div class="h-5 w-4/5 rounded bg-line dark:bg-night-line"></div>
        <div class="h-3 w-full rounded bg-line dark:bg-night-line"></div>
      </div>
    </div>`).join("");
}

function createCard(post) {
  const author = users[post.userId];
  const card = document.createElement("article");
  card.className = "group cursor-pointer rounded-card border border-line dark:border-night-line bg-card dark:bg-night-card overflow-hidden hover:shadow-card hover:-translate-y-1 transition";
  card.dataset.id = post.id;
  card.innerHTML = `
    <div class="h-36 bg-gradient-to-br ${coverFor(post.id)} p-5 flex items-end justify-between">
      <span class="font-display text-5xl font-bold text-white/90">#${post.id}</span>
      <span class="font-mono text-xs font-medium text-white/90 bg-black/20 rounded-full px-3 py-1">${readTime(post.body)} min read</span>
    </div>
    <div class="p-5">
      <div class="flex items-center gap-2 text-xs text-muted dark:text-night-muted">
        <span class="w-6 h-6 rounded-full bg-brand-soft dark:bg-brand-deep text-brand dark:text-brand-light grid place-items-center font-semibold text-[10px]">${initials(author.name)}</span>
        <span class="font-medium">${author.name}</span>
      </div>
      <h3 class="mt-3 font-display text-xl font-semibold leading-snug line-clamp-2 group-hover:text-brand dark:group-hover:text-brand-light"></h3>
      <p class="mt-2 text-sm text-muted dark:text-night-muted line-clamp-2"></p>
    </div>`;
  // textContent for API text, so it can never inject HTML
  card.querySelector("h3").textContent = capitalize(post.title);
  card.querySelector("p").textContent = capitalize(post.body);
  return card;
}

function getFilteredPosts() {
  const term = searchInput.value.trim().toLowerCase();
  const author = authorSelect.value;

  let list = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(term) || post.body.toLowerCase().includes(term);
    const matchesAuthor = author === "all" || post.userId === Number(author);
    return matchesSearch && matchesAuthor;
  });

  const sorters = {
    newest: (a, b) => b.id - a.id,
    oldest: (a, b) => a.id - b.id,
    az: (a, b) => a.title.localeCompare(b.title),
    za: (a, b) => b.title.localeCompare(a.title),
  };
  return [...list].sort(sorters[sortSelect.value]);
}

function render() {
  const list = getFilteredPosts();
  const filtersOn = searchInput.value.trim() !== "" || authorSelect.value !== "all";

  grid.innerHTML = "";
  list.slice(0, visible).forEach((post) => grid.append(createCard(post)));

  count.textContent = `Showing ${Math.min(visible, list.length)} of ${list.length} articles`;
  clearBtn.classList.toggle("hidden", !filtersOn);
  moreBtn.classList.toggle("hidden", visible >= list.length);

  if (list.length === 0) {
    message.classList.remove("hidden");
    message.innerHTML = `<p class="font-display text-2xl font-semibold">No articles found</p>
      <p class="mt-2 text-muted dark:text-night-muted">Try another word or writer.</p>`;
  } else {
    message.classList.add("hidden");
  }
}

function fillAuthors() {
  Object.values(users).forEach((user) => {
    authorSelect.append(new Option(user.name, user.id));
  });
}

// ---------- Modal ----------
async function openModal(id) {
  const post = posts.find((p) => p.id === id);
  const author = users[post.userId];
  document.querySelector("#modalCover").className = `h-40 relative bg-gradient-to-br ${coverFor(post.id)}`;
  const body = document.querySelector("#modalBody");
  body.innerHTML = `
    <p class="text-sm text-muted dark:text-night-muted">${author.name} · ${author.email.toLowerCase()}</p>
    <h2 class="mt-2 font-display text-3xl font-bold leading-tight"></h2>
    <p class="mt-4 leading-relaxed whitespace-pre-line"></p>
    <h3 class="mt-8 font-semibold">Comments</h3>
    <ul id="comments" class="mt-3 space-y-3"><li class="text-sm text-muted">Loading comments…</li></ul>`;
  body.querySelector("h2").textContent = capitalize(post.title);
  body.querySelector("h2 + p").textContent = capitalize(post.body);
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  try {
    const comments = await getJSON(`${API}/comments?postId=${id}`);
    const ul = body.querySelector("#comments");
    ul.innerHTML = "";
    comments.forEach((c) => {
      const li = document.createElement("li");
      li.className = "rounded-lg bg-paper dark:bg-night p-4 border border-line dark:border-night-line";
      li.innerHTML = `<p class="text-sm font-semibold"></p><p class="mt-1 text-sm text-muted dark:text-night-muted"></p>`;
      li.children[0].textContent = c.email.toLowerCase();
      li.children[1].textContent = capitalize(c.body);
      ul.append(li);
    });
  } catch {
    body.querySelector("#comments").innerHTML = `<li class="text-sm text-brand">Couldn't load comments.</li>`;
  }
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

// ---------- Events ----------
let timer;
searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => { visible = PAGE_SIZE; render(); }, 300);
});
authorSelect.addEventListener("change", () => { visible = PAGE_SIZE; render(); });
sortSelect.addEventListener("change", render);
document.querySelector("#toolbar").addEventListener("submit", (e) => e.preventDefault());

moreBtn.addEventListener("click", () => { visible += PAGE_SIZE; render(); });

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  authorSelect.value = "all";
  visible = PAGE_SIZE;
  render();
});

grid.addEventListener("click", (e) => {
  const card = e.target.closest("article");
  if (card) openModal(Number(card.dataset.id));
});
document.querySelector("#closeBtn").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

document.querySelector("#newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value.trim();
  const msg = document.querySelector("#newsMsg");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  msg.textContent = valid ? "Thanks! Check your inbox." : "Please enter a valid email.";
  msg.className = `md:col-span-2 text-sm font-medium ${valid ? "text-green-700 dark:text-green-400" : "text-brand dark:text-brand-light"}`;
});

// ---------- Start ----------
async function init() {
  showSkeletons();
  try {
    const [postsData, usersData] = await Promise.all([getJSON(`${API}/posts`), getJSON(`${API}/users`)]);
    posts = postsData;
    usersData.forEach((user) => { users[user.id] = user; });
    document.querySelector("#statPosts").textContent = posts.length;
    document.querySelector("#statAuthors").textContent = usersData.length;
    fillAuthors();
    render();
  } catch (err) {
    grid.innerHTML = "";
    count.textContent = "";
    message.classList.remove("hidden");
    message.innerHTML = `<p class="font-display text-2xl font-semibold">Something went wrong</p>
      <p class="mt-2 text-muted dark:text-night-muted">${err.message}</p>
      <button onclick="init()" class="mt-4 h-11 px-6 rounded-full bg-brand text-white text-sm font-semibold">Try again</button>`;
  }
}

init();
