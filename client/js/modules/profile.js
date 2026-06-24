/**
 * Profile module — view and edit user profiles.
 */
const Profile = (() => {

  async function render(userId) {
    const el = document.getElementById('page-profile');
    el.innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';
    Utils.showPage('profile');

    const [userData, postsData] = await Promise.all([
      API.get(`/users/${userId}`),
      API.get(`/posts/user/${userId}`)
    ]);

    if (!userData.success) {
      el.innerHTML = '<div class="empty-state"><p>User not found.</p></div>';
      return;
    }

    const u  = userData.user;
    const me = Auth.getUser();
    const isMe = u.id === me.id;

    el.innerHTML = `
      <!-- Profile header -->
      <div class="profile-header">
        <img class="profile-banner" src="${Utils.escape(u.banner || '/assets/uploads/default-banner.jpg')}" alt="" />
        <div class="profile-info">
          <div>
            <div class="profile-avatar-wrap">
              <img class="avatar avatar-xl" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
            </div>
            <h2 class="profile-name">${Utils.escape(u.full_name)}</h2>
            <p class="profile-handle">@${Utils.escape(u.username)}</p>
            ${u.bio ? `<p class="profile-bio">${Utils.escape(u.bio)}</p>` : ''}
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">${Utils.fmtNum(u.posts_count || 0)}</div>
                <div class="stat-label">Posts</div>
              </div>
              <div class="stat-item pointer" onclick="Profile.showList(${u.id}, 'followers')">
                <div class="stat-value">${Utils.fmtNum(u.followers_count || 0)}</div>
                <div class="stat-label">Followers</div>
              </div>
              <div class="stat-item pointer" onclick="Profile.showList(${u.id}, 'following')">
                <div class="stat-value">${Utils.fmtNum(u.following_count || 0)}</div>
                <div class="stat-label">Following</div>
              </div>
            </div>
            <p class="text-muted text-xs mt-2">
              <i class="fas fa-calendar"></i> Joined ${new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            ${isMe
              ? `<button class="btn btn-outline btn-sm" onclick="Profile.openEdit()">
                   <i class="fas fa-pen"></i> Edit Profile
                 </button>`
              : `<button class="btn ${u.is_following ? 'btn-secondary' : 'btn-primary'} btn-sm"
                         id="follow-btn-${u.id}"
                         onclick="Profile.follow(${u.id}, this)">
                   ${u.is_following ? 'Following' : 'Follow'}
                 </button>`
            }
          </div>
        </div>
      </div>

      <!-- Posts -->
      <h3 class="page-title" style="margin-bottom:.75rem;">Posts</h3>
      <div id="profile-posts">
        ${postsData.success && postsData.posts.length
          ? postsData.posts.map(p => renderPostCard(p, me)).join('')
          : `<div class="empty-state"><i class="fas fa-pencil"></i><p>No posts yet</p></div>`
        }
      </div>
    `;
  }

  function renderPostCard(post, me) {
    const isMine = post.author_id === me.id;
    return `
      <div class="post-card" id="post-${post.id}">
        <p class="post-content">${Utils.escape(post.content)}</p>
        ${post.image ? `<img class="post-image" src="${Utils.escape(post.image)}" loading="lazy" />` : ''}
        <div class="post-actions">
          <button class="action-btn ${post.liked_by_me ? 'liked' : ''}"
                  onclick="Posts.like(${post.id}, this)" id="like-btn-${post.id}">
            <i class="fa${post.liked_by_me ? 's' : 'r'} fa-heart"></i>
            <span id="like-count-${post.id}">${Utils.fmtNum(post.likes_count || 0)}</span>
          </button>
          <button class="action-btn" onclick="Posts.toggleComments(${post.id})">
            <i class="far fa-comment"></i>
            <span id="comment-count-${post.id}">${post.comments_count || 0}</span>
          </button>
          ${isMine ? `
          <button class="action-btn" style="color:var(--danger)" onclick="Posts.delete(${post.id})">
            <i class="fas fa-trash"></i>
          </button>` : ''}
        </div>
        <div id="comments-${post.id}" class="comments-section hidden"></div>
      </div>`;
  }

  async function follow(userId, btn) {
    const data = await API.post('/follow', { following_id: userId });
    if (!data.success) return Utils.toast(data.message, 'error');
    btn.textContent    = data.following ? 'Following' : 'Follow';
    btn.className      = `btn ${data.following ? 'btn-secondary' : 'btn-primary'} btn-sm`;
  }

  function openEdit() {
    const me = Auth.getUser();
    const backdrop = Utils.modal(`
      <div class="modal-header">
        <span class="modal-title">Edit Profile</span>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input id="edit-name" class="form-input" value="${Utils.escape(me.full_name)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea id="edit-bio" class="form-textarea" rows="3">${Utils.escape(me.bio || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Avatar</label>
        <input id="edit-avatar" type="file" class="form-input" accept="image/*" />
      </div>
      <div class="form-group">
        <label class="form-label">Banner</label>
        <input id="edit-banner" type="file" class="form-input" accept="image/*" />
      </div>
      <button class="btn btn-primary w-full" onclick="Profile.saveEdit(${me.id})">Save Changes</button>
    `);
  }

  async function saveEdit(userId) {
    const fd = new FormData();
    fd.append('full_name', document.getElementById('edit-name').value.trim());
    fd.append('bio', document.getElementById('edit-bio').value.trim());
    const avatar = document.getElementById('edit-avatar').files[0];
    const banner = document.getElementById('edit-banner').files[0];
    if (avatar) fd.append('avatar', avatar);
    if (banner) fd.append('banner', banner);

    const data = await API.uploadPut(`/users/${userId}`, fd);
    if (!data.success) return Utils.toast(data.message, 'error');

    Auth.setUser(data.user);
    document.querySelector('.modal-backdrop')?.remove();
    Utils.toast('Profile updated!', 'success');
    render(userId);
  }

  async function showList(userId, type) {
    const endpoint = type === 'followers' ? `/users/${userId}/followers` : `/users/${userId}/following`;
    const data = await API.get(endpoint);
    const list = data[type] || [];
    const backdrop = Utils.modal(`
      <div class="modal-header">
        <span class="modal-title">${type === 'followers' ? 'Followers' : 'Following'}</span>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${list.length ? list.map(u => `
        <div class="user-list-item" onclick="navigate('profile',${u.id});this.closest('.modal-backdrop').remove()">
          <img class="avatar avatar-sm" src="${Utils.escape(u.avatar || '/assets/uploads/default-avatar.png')}" />
          <div>
            <div class="suggest-name">${Utils.escape(u.full_name)}</div>
            <div class="suggest-handle">@${Utils.escape(u.username)}</div>
          </div>
        </div>`).join('')
      : '<p class="text-muted text-sm" style="padding:.5rem">None yet</p>'}
    `);
  }

  return { render, follow, openEdit, saveEdit, showList };
})();
