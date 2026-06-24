/**
 * Auth module — login, register, logout, current user state
 */
const Auth = (() => {
  let currentUser = null;

  function setUser(user) {
    currentUser = user;
    document.getElementById('nav-avatar').src = user.avatar || '/assets/uploads/default-avatar.png';
  }

  function getUser()  { return currentUser; }
  function getToken() { return localStorage.getItem('sn_token'); }

  async function init() {
    const token = getToken();
    if (!token) return false;
    const data = await API.get('/auth/me');
    if (data.success) { setUser(data.user); return true; }
    localStorage.removeItem('sn_token');
    return false;
  }

  async function login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('sn_token', data.token);
      setUser(data.user);
    }
    return data;
  }

  async function register(payload) {
    const data = await API.post('/auth/register', payload);
    if (data.success) {
      localStorage.setItem('sn_token', data.token);
      setUser(data.user);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('sn_token');
    currentUser = null;
  }

  return { init, login, register, logout, getUser, setUser, getToken };
})();
