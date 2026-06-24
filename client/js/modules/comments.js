/**
 * Comments module
 */
const Comments = (() => {

  function renderComment(c, me) {
    const isMine = c.user_id === me.id;
    return `
      <div class="comment-item" id="comment-${c.id}">
        <img class="avatar avatar-sm" src="${Utils.escape(c.avatar || '/assets/uploads/default-avatar.png')}" />
        <div class="comment-body">
          <div class="comment-text">
            <strong>${Utils.escape(c.full_name)}</strong>
            <span class="text-muted text-xs">@${Utils.escape(c.username)}</span><br/>
            ${Utils.escape(c.content)}
          </div>
          <div class="comment-meta">
            <span>${Utils.timeAgo(c.created_at)}</span>
            ${isMine ? `
              <a href="#" class="comment-action" onclick="Comments.edit(${c.id});return false;">Edit</a>
              <a href="#" class="comment-action" style="color:var(--danger)"
                 onclick="Comments.del(${c.id});return false;">Delete</a>
            ` : ''}
          </div>
        </div>
      </div>`;
  }

  async function load(postId, container) {
    container.innerHTML = '<div class="spinner"></div>';
    const data = await API.get(`/comments/${postId}`);
    if (!data.success) { container.innerHTML = '<p class="text-muted text-sm">Error loading comments.</p>'; return; }

    const me = Auth.getUser();
    container.innerHTML = data.comments.map(c => renderComment(c, me)).join('') + `
      <div class="compose-row mt-2" style="gap:.5rem;align-items:center;">
        <img class="avatar avatar-sm" src="${me.avatar || '/assets/uploads/default-avatar.png'}" />
        <input type="text" id="comment-input-${postId}" class="form-input"
               placeholder="Add a comment…" style="flex:1"
               onkeydown="if(event.key==='Enter')Comments.submit(${postId})" />
        <button class="btn btn-primary btn-sm" onclick="Comments.submit(${postId})">Send</button>
      </div>`;
  }

  async function submit(postId) {
    const input   = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;
    const data = await API.post('/comments', { post_id: postId, content });
    if (!data.success) return Utils.toast(data.message, 'error');
    input.value = '';
    // increment count
    const counter = document.getElementById(`comment-count-${postId}`);
    if (counter) counter.textContent = parseInt(counter.textContent || 0) + 1;
    // re-render comments
    const section = document.getElementById(`comments-${postId}`);
    if (section) await load(postId, section);
  }

  async function edit(commentId) {
    const el = document.querySelector(`#comment-${commentId} .comment-text`);
    if (!el) return;
    const old = el.querySelector('br') ?
      el.childNodes[el.childNodes.length - 1].textContent.trim() :
      el.textContent.trim();
    const backdrop = Utils.modal(`
      <div class="modal-header">
        <span class="modal-title">Edit Comment</span>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="form-group">
        <textarea id="edit-comment-text" class="form-textarea" rows="3">${Utils.escape(old)}</textarea>
      </div>
      <button class="btn btn-primary w-full" onclick="Comments.saveEdit(${commentId})">Save</button>
    `);
  }

  async function saveEdit(commentId) {
    const content = document.getElementById('edit-comment-text').value.trim();
    if (!content) return;
    const data = await API.put(`/comments/${commentId}`, { content });
    if (!data.success) return Utils.toast(data.message, 'error');
    document.querySelector('.modal-backdrop')?.remove();
    Utils.toast('Comment updated', 'success');
    // refresh parent post comments
    const commentEl = document.getElementById(`comment-${commentId}`);
    if (commentEl) {
      const section = commentEl.closest('.comments-section');
      const postCard = section?.closest('.post-card');
      const postId = postCard?.id?.replace('post-', '');
      if (postId) await load(postId, section);
    }
  }

  async function del(commentId) {
    if (!confirm('Delete this comment?')) return;
    const commentEl = document.getElementById(`comment-${commentId}`);
    const section = commentEl?.closest('.comments-section');
    const postCard = section?.closest('.post-card');
    const postId = postCard?.id?.replace('post-', '');
    const data = await API.delete(`/comments/${commentId}`);
    if (!data.success) return Utils.toast(data.message, 'error');
    const counter = postId ? document.getElementById(`comment-count-${postId}`) : null;
    if (counter) counter.textContent = Math.max(0, parseInt(counter.textContent || 1) - 1);
    if (postId && section) await load(postId, section);
  }

  return { load, submit, edit, saveEdit, del };
})();
