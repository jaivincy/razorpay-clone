(() => {
  const apiBase = window.PAYFLOW_API_URL || 'http://localhost:5000/api';
  const storage = window.sessionStorage;
  const state = { accessToken: storage.getItem('payflow.accessToken'), refreshToken: storage.getItem('payflow.refreshToken') };
  const $ = (selector) => document.querySelector(selector);
  const authModal = $('#authModal');
  const profileModal = $('#profileModal');
  let mode = 'login';

  const saveTokens = (tokens) => {
    state.accessToken = tokens.accessToken;
    state.refreshToken = tokens.refreshToken;
    storage.setItem('payflow.accessToken', state.accessToken);
    storage.setItem('payflow.refreshToken', state.refreshToken);
  };
  const clearTokens = () => {
    state.accessToken = null; state.refreshToken = null;
    storage.removeItem('payflow.accessToken'); storage.removeItem('payflow.refreshToken');
  };
  const message = (target, text, success = false) => { target.textContent = text || ''; target.classList.toggle('success', success); };
  const errorText = (payload) => payload?.errors?.map((error) => error.message).join(' ') || payload?.message || 'Something went wrong. Please try again.';
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  const request = async (path, options = {}, retry = true) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (options.auth && state.accessToken) headers.Authorization = `Bearer ${state.accessToken}`;
    const response = await fetch(`${apiBase}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({ success: false, message: 'Unexpected server response.' }));
    if (response.status === 401 && options.auth && retry && state.refreshToken && await refreshSession()) return request(path, options, false);
    if (!response.ok) throw payload;
    return payload;
  };
  const refreshSession = async () => {
    try {
      const payload = await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: state.refreshToken }) }, false);
      saveTokens(payload.data.tokens);
      return true;
    } catch { clearTokens(); renderActions(); return false; }
  };
  const renderActions = () => {
    const actions = $('#authActions');
    if (!actions) return;
    actions.innerHTML = state.accessToken
      ? '<button class="login" id="accountButton" type="button">My account</button><button class="btn btn-small" id="navLogout" type="button">Log out</button>'
      : '<button class="login auth-trigger" type="button" data-auth-mode="login">Log in</button><button class="btn btn-small auth-trigger" type="button" data-auth-mode="register">Sign up <span>&rarr;</span></button>';
  };
  const openAuth = (nextMode) => {
    mode = nextMode;
    const registering = mode === 'register';
    $('#authTitle').textContent = registering ? 'Create your account' : 'Welcome back';
    $('#authCopy').textContent = registering ? 'Start building with PayFlow in a few minutes.' : 'Log in to view your PayFlow profile.';
    $('#registerNameField').hidden = !registering;
    $('#authPassword').autocomplete = registering ? 'new-password' : 'current-password';
    $('#authSubmit').textContent = registering ? 'Create account' : 'Log in';
    $('#authSwitch').textContent = registering ? 'Already have an account? Log in' : 'Need an account? Sign up';
    message($('#authFeedback'), ''); authModal.hidden = false; authModal.setAttribute('aria-hidden', 'false');
    (registering ? $('#authFullName') : $('#authEmail')).focus();
  };
  const closeModal = (modal) => { modal.hidden = true; modal.setAttribute('aria-hidden', 'true'); };
  const showProfile = async () => {
    try {
      const payload = await request('/users/profile', { auth: true });
      const user = payload.data.user;
      $('#profileDetails').innerHTML = `<div><span>Name</span><strong>${escapeHtml(user.full_name)}</strong></div><div><span>Email</span><strong>${escapeHtml(user.email)}</strong></div><div><span>Member since</span><strong>${new Date(user.created_at).toLocaleDateString()}</strong></div>`;
      message($('#profileFeedback'), ''); profileModal.hidden = false; profileModal.setAttribute('aria-hidden', 'false');
    } catch (error) { openAuth('login'); message($('#authFeedback'), errorText(error)); }
  };

  document.addEventListener('click', async (event) => {
    const trigger = event.target.closest('.auth-trigger');
    if (trigger) openAuth(trigger.dataset.authMode);
    if (event.target.closest('.auth-close')) closeModal(event.target.closest('.auth-modal'));
    if (event.target.closest('#accountButton')) showProfile();
    if (event.target.closest('#navLogout') || event.target.closest('#logoutButton')) {
      try { if (state.refreshToken) await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: state.refreshToken }) }, false); } catch { /* The local session must still end. */ }
      clearTokens(); renderActions(); closeModal(profileModal);
    }
  });
  $('#authSwitch').addEventListener('click', () => openAuth(mode === 'login' ? 'register' : 'login'));
  $('#authForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const feedback = $('#authFeedback');
    const submit = $('#authSubmit');
    const body = { email: $('#authEmail').value, password: $('#authPassword').value };
    if (mode === 'register') body.full_name = $('#authFullName').value;
    submit.disabled = true; message(feedback, '');
    try {
      const payload = await request(`/auth/${mode === 'register' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(body) }, false);
      saveTokens(payload.data.tokens); renderActions(); closeModal(authModal); $('#authForm').reset(); await showProfile();
    } catch (error) { message(feedback, errorText(error)); } finally { submit.disabled = false; }
  });
  authModal.addEventListener('click', (event) => { if (event.target === authModal) closeModal(authModal); });
  profileModal.addEventListener('click', (event) => { if (event.target === profileModal) closeModal(profileModal); });
  renderActions();
})();
