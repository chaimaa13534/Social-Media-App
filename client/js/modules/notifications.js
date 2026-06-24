/**
 * Notifications module
 */
const Notifications = (() => {

  const iconMap = {
    like:    { icon: 'fa-heart',       cls: 'like',    text: 'liked your post' },
    comment: { icon: 'fa-comment',     cls: 'comment', text: 'commented on your post' },
    follow:  { icon: 'fa-user-plus',   cls: 'follow',  text: 'started following you' }
  };

  function renderItem(n) {
    const { icon, cls, text } = iconMap[n.type] || iconMap.follow;
    return `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="Notifications.handleClick(${n.post_id || 0}, ${n.from_id})">
        <div class="flex items-center gap-2">
          <img class="avatar avatar-sm" src="${Utils.escape(n.from_avatar || '/assets/uploads/default-avatar.png')}" />
          <div class="notif-icon ${cls}"><i class="fas ${icon}"></i></div>
        </div>
        <div class="flex-col gap-1" style="flex:1;min-width:0;">
          <p class="notif-text">
            <strong>${Utils.escape(n.from_name)}</strong> ${text}
          </p>
          <span class="notif-time">${Utils.timeAgo(n.created_at)}</span>
        </div>
      </div>`;
  }

  /* ── Dropdown (in navbar) ─────────────────────────────── */
  async function loadDropdown() {
    const dd = document.getElementById('notif-dropdown');
    dd.innerHTML = `
      <div class="notif-header">
        Notifications
        <button class="btn btn-sm" style="font-size:.75rem;padding:.2rem .5rem" onclick="Notifications.markRead()">
          Mark all read
        </button>
      </div>
      <div id="notif-list"><div class="spinner" style="margin:.75rem auto"></div></div>`;

    const data = await API.get('/notifications');
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (!data.success || !data.notifications.length) {
      list.innerHTML = '<div class="empty-state" style="padding:1.5rem"><p>No notifications yet</p></div>';
      return;
    }
    list.innerHTML = data.notifications.map(renderItem).join('');
  }

  function toggleDropdown() {
    const dd  = document.getElementById('notif-dropdown');
    const was = dd.classList.contains('hidden');
    // close any other dropdowns
    document.querySelectorAll('.notif-dropdown, .dropdown-menu').forEach(e => e.classList.add('hidden'));
    if (was) {
      dd.classList.remove('hidden');
      loadDropdown();
      markRead();
    }
  }

  async function markRead() {
    await API.put('/notifications/mark-read', {});
    document.getElementById('notif-badge')?.classList.add('hidden');
  }

  async function refreshBadge() {
    const data = await API.get('/notifications/unread');
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (data.success && data.count > 0) {
      badge.textContent = data.count > 99 ? '99+' : data.count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function handleClick(postId, userId) {
    document.getElementById('notif-dropdown')?.classList.add('hidden');
    if (postId) navigate('feed');
    else navigate('profile', userId);
  }

  /* ── Notifications page ───────────────────────────────── */
  async function renderPage() {
    const el = document.getElementById('page-notifications');
    Utils.showPage('notifications');
    el.innerHTML = `<h2 class="page-title">Notifications</h2><div id="notif-page-list"><div class="spinner"></div></div>`;
    await markRead();
    const data = await API.get('/notifications');
    const list = document.getElementById('notif-page-list');
    if (!list) return;
    if (!data.success || !data.notifications.length) {
      list.innerHTML = `<div class="empty-state"><i class="fas fa-bell"></i><p>No notifications yet</p></div>`;
      return;
    }
    list.innerHTML = data.notifications.map(renderItem).join('');
  }

  return { toggleDropdown, markRead, refreshBadge, handleClick, renderPage };
})();
