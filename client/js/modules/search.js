/**
 * Search module — navbar inline search + explore page.
 */
const Search = (() => {

  function initNavSearch() {
    const input   = document.getElementById('nav-search');
    const results = document.getElementById('search-results');
    if (!input) return;

    const doSearch = Utils.debounce(async (q) => {
      if (!q) { results.classList.add('hidden'); return; }
      const data = await API.get(`/search?q=${encodeURIComponent(q)}`);
      if (!data.success) return;
      const { users, posts } = data;

      if (!users.length && !posts.length) {
        results.innerHTML = '<div class="search-result-item text-muted">No results</div>';
        results.classList.remove('hidden');
        return;
      }

      let html = '';
      if (users.length) {
        html += `<div style="padding:.35rem .75rem;font-size:.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">People</div>`;
        html += users.slice(0, 5).map(u => `
          <div class="search-result-item" onclick="navigate('profile',${u.id})">
            <img class="avatar avatar-sm" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
            <div>
              <div class="search-result-name">${Utils.escape(u.full_name)}</div>
              <div class="search-result-meta">@${Utils.escape(u.username)} · ${Utils.fmtNum(u.followers_count)} followers</div>
            </div>
          </div>`).join('');
      }
      if (posts.length) {
        html += `<div style="padding:.35rem .75rem;font-size:.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Posts</div>`;
        html += posts.slice(0, 3).map(p => `
          <div class="search-result-item" onclick="navigate('profile',${p.author_id})">
            <img class="avatar avatar-sm" src="${Utils.escape(p.avatar || '/assets/uploads/default-avatar.png')}" />
            <div>
              <div class="search-result-name">${Utils.escape(p.full_name)}</div>
              <div class="search-result-meta">${Utils.escape(p.content.slice(0, 60))}…</div>
            </div>
          </div>`).join('');
      }

      results.innerHTML = html;
      results.classList.remove('hidden');
    }, 300);

    input.addEventListener('input', () => doSearch(input.value.trim()));
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-search-wrap')) results.classList.add('hidden');
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') results.classList.add('hidden');
    });
  }

  async function renderExplorePage() {
    const el = document.getElementById('page-explore');
    Utils.showPage('explore');
    el.innerHTML = `
      <h2 class="page-title">Explore</h2>
      <div class="form-group" style="position:relative;">
        <i class="fas fa-search" style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--text-muted)"></i>
        <input id="explore-search" class="form-input" style="padding-left:2.25rem"
               placeholder="Search people and posts…" type="text" />
      </div>
      <div id="explore-results">
        <div id="explore-people" class="mb-4"></div>
        <div id="explore-posts"></div>
      </div>`;

    const input = document.getElementById('explore-search');
    const run = Utils.debounce(async (q) => {
      if (!q) { renderAllUsers(); return; }
      const data = await API.get(`/search?q=${encodeURIComponent(q)}`);
      if (!data.success) return;
      renderResults(data.users, data.posts);
    }, 350);

    input.addEventListener('input', () => run(input.value.trim()));
    renderAllUsers();
  }

  async function renderAllUsers() {
    const ppl = document.getElementById('explore-people');
    if (!ppl) return;
    ppl.innerHTML = '<h3 class="page-title" style="font-size:1rem;margin-bottom:.75rem">People to follow</h3><div class="spinner"></div>';
    const data = await API.get('/users');
    if (!data.success) { ppl.innerHTML = ''; return; }
    const me = Auth.getUser();
    ppl.innerHTML = `
      <h3 class="page-title" style="font-size:1rem;margin-bottom:.75rem">People to follow</h3>
      ${data.users.filter(u => u.id !== me.id).map(u => `
        <div class="user-list-item" onclick="navigate('profile',${u.id})">
          <img class="avatar avatar-md" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
          <div style="flex:1;min-width:0;">
            <div class="suggest-name">${Utils.escape(u.full_name)}</div>
            <div class="suggest-handle">@${Utils.escape(u.username)} · ${Utils.fmtNum(u.followers_count)} followers</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();Profile.follow(${u.id}, this)">Follow</button>
        </div>`).join('')}`;
  }

  function renderResults(users, posts) {
    const ppl  = document.getElementById('explore-people');
    const psts = document.getElementById('explore-posts');
    if (!ppl || !psts) return;

    ppl.innerHTML = users.length
      ? `<h3 class="page-title" style="font-size:1rem;margin-bottom:.5rem">People</h3>` +
        users.map(u => `
          <div class="user-list-item" onclick="navigate('profile',${u.id})">
            <img class="avatar avatar-md" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
            <div>
              <div class="suggest-name">${Utils.escape(u.full_name)}</div>
              <div class="suggest-handle">@${Utils.escape(u.username)}</div>
            </div>
          </div>`).join('')
      : '';

    psts.innerHTML = posts.length
      ? `<h3 class="page-title" style="font-size:1rem;margin:.75rem 0 .5rem">Posts</h3>` +
        posts.map(p => `
          <div class="post-card">
            <div class="post-header" onclick="navigate('profile',${p.author_id})" style="cursor:pointer">
              <img class="post-avatar" src="${Utils.escape(p.avatar || '/assets/uploads/default-avatar.png')}" />
              <div class="post-meta">
                <span class="post-author">${Utils.escape(p.full_name)}</span>
                <span class="post-username">@${Utils.escape(p.username)}</span>
                <span class="post-time">${Utils.timeAgo(p.created_at)}</span>
              </div>
            </div>
            <p class="post-content">${Utils.escape(p.content)}</p>
            <div class="post-actions">
              <span class="action-btn"><i class="far fa-heart"></i> ${Utils.fmtNum(p.likes_count || 0)}</span>
            </div>
          </div>`).join('')
      : '';
  }

  return { initNavSearch, renderExplorePage };
})();
