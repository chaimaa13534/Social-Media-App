/**
 * SocialNet — main app entry point.
 * Handles: boot, routing, auth forms, dashboard, right panel.
 */

/* ── Router ────────────────────────────────────────────── */
function navigate(page, param) {
  // Close any open dropdowns/menus
  document.querySelectorAll('.dropdown-menu, .notif-dropdown, .search-results')
    .forEach(el => el.classList.add('hidden'));

  if (page === 'feed') {
    Utils.showPage('feed');
    Posts.renderFeedPage();
  } else if (page === 'explore') {
    Search.renderExplorePage();
  } else if (page === 'notifications') {
    Notifications.renderPage();
  } else if (page === 'dashboard') {
    renderDashboard();
  } else if (page === 'profile-me') {
    const me = Auth.getUser();
    if (me) Profile.render(me.id);
  } else if (page === 'profile' && param) {
    Profile.render(param);
  }
}

/* ── Dashboard ─────────────────────────────────────────── */
async function renderDashboard() {
  const el = document.getElementById('page-dashboard');
  Utils.showPage('dashboard');
  el.innerHTML = `<h2 class="page-title">Dashboard</h2>
    <div class="stats-grid" id="stats-grid"><div class="spinner"></div></div>
    <div class="card" id="top-users-card"></div>`;

  const data = await API.get('/dashboard/stats');
  if (!data.success) return;

  const { stats, topUsers } = data;
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-val">${Utils.fmtNum(stats.users)}</div>
      <div class="stat-card-label"><i class="fas fa-users"></i> Users</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val">${Utils.fmtNum(stats.posts)}</div>
      <div class="stat-card-label"><i class="fas fa-file-alt"></i> Posts</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val">${Utils.fmtNum(stats.comments)}</div>
      <div class="stat-card-label"><i class="fas fa-comments"></i> Comments</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val">${Utils.fmtNum(stats.follows)}</div>
      <div class="stat-card-label"><i class="fas fa-user-plus"></i> Follows</div>
    </div>`;

  document.getElementById('top-users-card').innerHTML = `
    <p class="suggest-title" style="margin-bottom:.75rem">
      <i class="fas fa-trophy" style="color:var(--warning)"></i> Top Users
    </p>
    ${topUsers.map((u, i) => `
      <div class="user-list-item" onclick="navigate('profile',${u.id})">
        <span style="font-weight:800;color:var(--accent);width:20px;text-align:center">${i + 1}</span>
        <img class="avatar avatar-sm" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
        <div style="flex:1;min-width:0">
          <div class="suggest-name">${Utils.escape(u.full_name)}</div>
          <div class="suggest-handle">${Utils.fmtNum(u.followers_count)} followers</div>
        </div>
      </div>`).join('')}`;
}

/* ── Right panel ───────────────────────────────────────── */
async function loadRightPanel() {
  // Trending
  const trendData = await API.get('/posts/trending');
  const trendEl   = document.getElementById('trending-list');
  if (trendEl) {
    trendEl.innerHTML = trendData.success && trendData.posts.length
      ? trendData.posts.map(p => `
          <div class="trend-item" onclick="navigate('profile',${p.author_id || 0})">
            <div class="trend-tag truncate">${Utils.escape(p.content.slice(0, 40))}…</div>
            <div class="trend-count"><i class="far fa-heart"></i> ${Utils.fmtNum(p.likes_count)} likes</div>
          </div>`).join('')
      : '<p class="text-muted text-xs">No trending posts yet</p>';
  }

  // Suggestions
  const suggestData = await API.get('/users/suggestions');
  const suggestEl   = document.getElementById('suggestions-list');
  if (suggestEl) {
    suggestEl.innerHTML = suggestData.success && suggestData.suggestions.length
      ? suggestData.suggestions.map(u => `
          <div class="suggest-user">
            <img class="avatar avatar-sm" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}"
                 style="cursor:pointer" onclick="navigate('profile',${u.id})" />
            <div class="suggest-info" style="cursor:pointer" onclick="navigate('profile',${u.id})">
              <div class="suggest-name truncate">${Utils.escape(u.full_name)}</div>
              <div class="suggest-handle">@${Utils.escape(u.username)}</div>
            </div>
            <button class="btn btn-outline btn-sm"
                    onclick="Profile.follow(${u.id}, this)" style="flex-shrink:0">
              Follow
            </button>
          </div>`).join('')
      : '<p class="text-muted text-xs">No suggestions</p>';
  }
}

/* ── Theme ─────────────────────────────────────────────── */
let _themeInitialized = false;

function initTheme() {
  // Apply saved theme immediately (before paint)
  const saved = localStorage.getItem('sn_theme') || 'dark';
  if (saved === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }

  // Bind toggle only once
  if (_themeInitialized) return;
  _themeInitialized = true;

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Set correct icon immediately
  _updateThemeIcon();

  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('sn_theme', isLight ? 'light' : 'dark');
    _updateThemeIcon();
  });
}

function _updateThemeIcon() {
  const icon    = document.querySelector('#theme-toggle i');
  const isLight = document.body.classList.contains('light');
  if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
}

/* ── Auth forms ─────────────────────────────────────────── */
function showAuthView() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('main-view').classList.add('hidden');
}

function showMainView() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('main-view').classList.remove('hidden');
}

function bindAuthForms() {
  // Toggle login/register
  document.getElementById('go-register')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  });
  document.getElementById('go-login')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  // Login
  document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return Utils.toast('Fill in all fields', 'error');

    const btn = document.getElementById('login-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';

    const data = await Auth.login(email, password);
    btn.disabled = false; btn.innerHTML = 'Sign In';

    if (!data.success) return Utils.toast(data.message, 'error');
    bootApp();
  });

  // Enter key on password field
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn')?.click();
  });

  // Register
  document.getElementById('register-btn')?.addEventListener('click', async () => {
    const full_name = document.getElementById('reg-name').value.trim();
    const username  = document.getElementById('reg-username').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const password  = document.getElementById('reg-password').value;

    if (!full_name || !username || !email || !password) {
      return Utils.toast('Fill in all fields', 'error');
    }

    const btn = document.getElementById('register-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';

    const data = await Auth.register({ full_name, username, email, password });
    btn.disabled = false; btn.innerHTML = 'Create Account';

    if (!data.success) return Utils.toast(data.message, 'error');
    Utils.toast('Welcome to SocialNet! 🎉', 'success');
    bootApp();
  });
}

/* ── Sidebar nav ────────────────────────────────────────── */
function bindSidebar() {
  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  document.getElementById('logout-link')?.addEventListener('click', e => {
    e.preventDefault();
    Auth.logout();
    showAuthView();
    Utils.toast('Logged out', 'success');
  });
}

/* ── Notification button ────────────────────────────────── */
function bindNotifBtn() {
  document.getElementById('notif-btn')?.addEventListener('click', () => {
    Notifications.toggleDropdown();
  });
  // close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
      document.getElementById('notif-dropdown')?.classList.add('hidden');
    }
  });
}

/* ── Global event: auth expired ─────────────────────────── */
window.addEventListener('auth:expired', () => {
  Auth.logout();
  showAuthView();
  Utils.toast('Session expired. Please log in again.', 'error');
});

/* ── Close menus on outside click ───────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.closest('[onclick*="toggleMenu"]') && !e.target.closest('.dropdown-menu')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
  }
});

/* ── Boot ───────────────────────────────────────────────── */
async function bootApp() {
  showMainView();
  initTheme();
  bindSidebar();
  bindNotifBtn();
  Search.initNavSearch();

  // Load feed as default page
  navigate('feed');

  // Load right panel and notification badge
  loadRightPanel();
  Notifications.refreshBadge();

  // Refresh badge every 60s
  setInterval(Notifications.refreshBadge, 60000);

  // Connect socket
  SocketClient.connect();
}

/* ── DOMContentLoaded ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Remove pre-paint helper class now that body.light takes over
  document.documentElement.classList.remove('light-preload');

  initTheme();
  bindAuthForms();

  const loader = document.getElementById('global-loader');

  const loggedIn = await Auth.init();

  loader.classList.add('done');

  if (loggedIn) {
    bootApp();
  } else {
    showAuthView();
  }
});