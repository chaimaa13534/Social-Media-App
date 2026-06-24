/**
 * Posts module — feed rendering, CRUD, likes.
 */
const Posts = (() => {

  let page = 1;
  let loading = false;
  let hasMore = true;
  let followingOnly = false;

  /* ── Render single post card ──────────────────────────── */
  function renderCard(post, me) {
    const isMine = post.author_id === me.id;
    return `
      <div class="post-card" id="post-${post.id}">
        <div class="post-header">
          <img class="post-avatar" src="${Utils.escape(post.avatar || '/assets/uploads/default-avatar.png')}" alt="" />
          <div class="post-meta">
            <a class="post-author" href="#" onclick="navigate('profile',${post.author_id});return false;">
              ${Utils.escape(post.full_name)}
            </a>
            <span class="post-username">@${Utils.escape(post.username)}</span>
            <span class="post-time">${Utils.timeAgo(post.created_at)}</span>
          </div>
          ${isMine ? `
          <div style="position:relative;">
            <button class="post-options-btn" onclick="Posts.toggleMenu(${post.id})">
              <i class="fas fa-ellipsis"></i>
            </button>
            <div id="menu-${post.id}" class="dropdown-menu hidden">
              <div class="dropdown-item" onclick="Posts.openEdit(${post.id})">
                <i class="fas fa-pen"></i> Edit
              </div>
              <div class="dropdown-item danger" onclick="Posts.delete(${post.id})">
                <i class="fas fa-trash"></i> Delete
              </div>
            </div>
          </div>` : ''}
        </div>
        <p class="post-content">${Utils.escape(post.content)}</p>
        ${post.image ? `<img class="post-image" src="${Utils.escape(post.image)}" alt="Post image" loading="lazy" />` : ''}
        <div class="post-actions">
          <button class="action-btn ${post.liked_by_me ? 'liked' : ''}"
                  onclick="Posts.like(${post.id}, this)"
                  id="like-btn-${post.id}">
            <i class="fa${post.liked_by_me ? 's' : 'r'} fa-heart"></i>
            <span id="like-count-${post.id}">${Utils.fmtNum(post.likes_count || 0)}</span>
          </button>
          <button class="action-btn" onclick="Posts.toggleComments(${post.id})">
            <i class="far fa-comment"></i>
            <span id="comment-count-${post.id}">${Utils.fmtNum(post.comments_count || 0)}</span>
          </button>
          <button class="action-btn" onclick="Posts.share(${post.id})">
            <i class="fas fa-share-nodes"></i> Share
          </button>
        </div>
        <div id="comments-${post.id}" class="comments-section hidden"></div>
      </div>`;
  }

  /* ── Load feed ────────────────────────────────────────── */
  async function loadFeed(reset = false) {
    if (loading) return;
    if (reset)   { page = 1; hasMore = true; }
    if (!hasMore) return;

    loading = true;
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (reset) container.innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';

    const data = await API.get(`/posts?page=${page}&following=${followingOnly}`);
    loading = false;

    if (!data.success) return Utils.toast(data.message, 'error');

    const me = Auth.getUser();
    if (reset) container.innerHTML = '';

    if (data.posts.length === 0 && page === 1) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-newspaper"></i>
          <p>No posts yet. Be the first to share something!</p>
        </div>`;
      return;
    }

    data.posts.forEach(p => container.insertAdjacentHTML('beforeend', renderCard(p, me)));
    hasMore = data.hasMore;
    if (hasMore) page++;
  }

  /* ── Render feed page ─────────────────────────────────── */
  function renderFeedPage() {
    const me = Auth.getUser();
    const el = document.getElementById('page-feed');
    el.innerHTML = `
      <!-- Compose Box -->
      <div id="compose-box">
        <div class="compose-row">
          <img class="compose-avatar" src="${me.avatar || '/assets/uploads/default-avatar.png'}" />
          <div class="compose-inner">
            <textarea id="compose-text" class="compose-textarea"
              placeholder="What's on your mind?" rows="2"
              oninput="Posts.updateCharCount(this)"></textarea>
            <div id="compose-img-preview"></div>
            <div class="compose-footer">
              <div class="compose-tools">
                <label class="compose-tool" title="Add image">
                  <i class="fas fa-image"></i>
                  <input id="compose-img" type="file" accept="image/*" hidden />
                </label>
              </div>
              <span id="compose-chars" class="char-count">0 / 1000</span>
              <button id="compose-btn" class="btn btn-primary btn-sm" onclick="Posts.create()">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feed tabs -->
      <div class="tabs">
        <button class="tab-btn active" id="tab-all"
          onclick="Posts.setTab('all')">For You</button>
        <button class="tab-btn" id="tab-following"
          onclick="Posts.setTab('following')">Following</button>
      </div>

      <!-- Posts -->
      <div id="posts-container"></div>

      <!-- Infinite scroll sentinel -->
      <div id="scroll-sentinel" style="height:10px;"></div>
    `;

    // Image preview
    const imgInput = document.getElementById('compose-img');
    Utils.previewImage(imgInput, document.getElementById('compose-img-preview'));

    loadFeed(true);
    setupInfiniteScroll();
  }

  function setTab(tab) {
    followingOnly = tab === 'following';
    document.getElementById('tab-all').classList.toggle('active', !followingOnly);
    document.getElementById('tab-following').classList.toggle('active', followingOnly);
    loadFeed(true);
  }

  function updateCharCount(ta) {
    const n = ta.value.length;
    const el = document.getElementById('compose-chars');
    el.textContent = `${n} / 1000`;
    el.classList.toggle('warn', n > 900 && n <= 1000);
    el.classList.toggle('over', n > 1000);
  }

  /* ── Create post ──────────────────────────────────────── */
  async function create() {
    const text = document.getElementById('compose-text').value.trim();
    const img  = document.getElementById('compose-img')?.files[0];
    if (!text) return Utils.toast('Write something first!', 'error');
    if (text.length > 1000) return Utils.toast('Too long (max 1000 chars)', 'error');

    const btn = document.getElementById('compose-btn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';

    let data;
    if (img) {
      const fd = new FormData();
      fd.append('content', text);
      fd.append('image', img);
      data = await API.upload('/posts', fd);
    } else {
      data = await API.post('/posts', { content: text });
    }

    btn.disabled = false; btn.innerHTML = 'Post';

    if (!data.success) return Utils.toast(data.message, 'error');

    document.getElementById('compose-text').value = '';
    document.getElementById('compose-img-preview').innerHTML = '';
    document.getElementById('compose-chars').textContent = '0 / 1000';

    const container = document.getElementById('posts-container');
    const me = Auth.getUser();
    container.insertAdjacentHTML('afterbegin', renderCard(data.post, me));
    Utils.toast('Posted!', 'success');
  }

  /* ── Like / unlike ────────────────────────────────────── */
  async function like(postId, btn) {
    const data = await API.post('/likes', { post_id: postId });
    if (!data.success) return;
    btn.classList.toggle('liked', data.liked);
    btn.querySelector('i').className = `fa${data.liked ? 's' : 'r'} fa-heart`;
    document.getElementById(`like-count-${postId}`).textContent = Utils.fmtNum(data.likes_count);
  }

  /* ── Toggle comments ──────────────────────────────────── */
  async function toggleComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return;
    if (section.classList.contains('hidden')) {
      section.classList.remove('hidden');
      await Comments.load(postId, section);
    } else {
      section.classList.add('hidden');
    }
  }

  /* ── Delete ───────────────────────────────────────────── */
  async function del(postId) {
    if (!confirm('Delete this post?')) return;
    const data = await API.delete(`/posts/${postId}`);
    if (!data.success) return Utils.toast(data.message, 'error');
    document.getElementById(`post-${postId}`)?.remove();
    Utils.toast('Post deleted', 'success');
  }

  /* ── Edit ─────────────────────────────────────────────── */
  async function openEdit(postId) {
    const card = document.getElementById(`post-${postId}`);
    const content = card.querySelector('.post-content').textContent.trim();
    const backdrop = Utils.modal(`
      <div class="modal-header">
        <span class="modal-title">Edit Post</span>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="form-group">
        <textarea id="edit-content" class="form-textarea" rows="4">${Utils.escape(content)}</textarea>
      </div>
      <button class="btn btn-primary w-full" onclick="Posts.saveEdit(${postId})">Save Changes</button>
    `);
  }

  async function saveEdit(postId) {
    const content = document.getElementById('edit-content').value.trim();
    if (!content) return Utils.toast('Content required', 'error');
    const data = await API.put(`/posts/${postId}`, { content });
    if (!data.success) return Utils.toast(data.message, 'error');
    document.querySelector(`#post-${postId} .post-content`).textContent = content;
    document.querySelector('.modal-backdrop')?.remove();
    Utils.toast('Updated!', 'success');
  }

  /* ── Options menu toggle ──────────────────────────────── */
  function toggleMenu(postId) {
    document.querySelectorAll('.dropdown-menu').forEach(m => {
      if (m.id !== `menu-${postId}`) m.classList.add('hidden');
    });
    document.getElementById(`menu-${postId}`)?.classList.toggle('hidden');
  }

  /* ── Share ────────────────────────────────────────────── */
  function share(postId) {
    const url = `${location.origin}#post/${postId}`;
    navigator.clipboard?.writeText(url).then(() => Utils.toast('Link copied!', 'success'));
  }

  /* ── Infinite scroll ──────────────────────────────────── */
  function setupInfiniteScroll() {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadFeed();
    }, { rootMargin: '200px' });
    obs.observe(sentinel);
  }

  return { renderFeedPage, loadFeed, create, like, toggleComments,
           delete: del, openEdit, saveEdit, toggleMenu, share, setTab, updateCharCount };
})();
