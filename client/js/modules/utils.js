/**
 * Utility helpers shared across the app.
 */
const Utils = (() => {

  /* ── Toast ─────────────────────────────────────────── */
  function toast(msg, type = 'info', ms = 3500) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  /* ── Time ago ─────────────────────────────────────── */
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'just now';
    if (m < 60)  return `${m}m`;
    if (m < 1440) return `${Math.floor(m/60)}h`;
    return `${Math.floor(m/1440)}d`;
  }

  /* ── Escape HTML ──────────────────────────────────── */
  function escape(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ── Show / hide pages ────────────────────────────── */
  function showPage(name) {
    const pages = ['feed', 'explore', 'notifications', 'dashboard', 'profile'];
    pages.forEach(p => {
      const el = document.getElementById(`page-${p}`);
      if (el) el.classList.toggle('hidden', p !== name && !(name.startsWith('profile') && p === 'profile'));
    });
    // Update sidebar
    document.querySelectorAll('.sidebar-link[data-page]').forEach(l => {
      l.classList.toggle('active', l.dataset.page === name || (name.startsWith('profile') && l.dataset.page === 'profile-me'));
    });
  }

  /* ── Modal ────────────────────────────────────────── */
  function modal(html) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<div class="modal">${html}</div>`;
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  /* ── Format number ────────────────────────────────── */
  function fmtNum(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return String(n);
  }

  /* ── Debounce ─────────────────────────────────────── */
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ── Image preview ────────────────────────────────── */
  function previewImage(inputEl, previewEl) {
    inputEl.addEventListener('change', () => {
      const file = inputEl.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        previewEl.innerHTML = `
          <div class="img-preview">
            <img src="${e.target.result}" />
            <button class="img-preview-remove" onclick="this.parentElement.remove(); document.getElementById('${inputEl.id}').value=''">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
      };
      reader.readAsDataURL(file);
    });
  }

  return { toast, timeAgo, escape, showPage, modal, fmtNum, debounce, previewImage };
})();
