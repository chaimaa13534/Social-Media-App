/**
 * API — thin wrapper around fetch().
 * All requests automatically include the JWT from localStorage.
 */
const API = (() => {
  const BASE = '/api';

  function getToken() { return localStorage.getItem('sn_token') || ''; }

  async function request(method, path, body = null, isFormData = false) {
    const headers = { Authorization: `Bearer ${getToken()}` };
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res  = await fetch(BASE + path, opts);
    const data = await res.json();
    if (!data.success && res.status === 401) {
      // Token expired — force logout
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return data;
  }

  return {
    get:    (path)            => request('GET',    path),
    post:   (path, body)      => request('POST',   path, body),
    put:    (path, body)      => request('PUT',    path, body),
    delete: (path)            => request('DELETE', path),
    upload: (path, formData)  => request('POST',   path, formData, true),
    uploadPut: (path, fd)     => request('PUT',    path, fd, true),
  };
})();
