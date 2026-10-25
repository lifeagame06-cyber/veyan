(function () {
  'use strict';
  const LIBRARY_PREFIX = 'vayenLibraryV1:';
  const LEGACY_PREFIX = 'vayenSavedProductsDemoV1_';
  let uid = null;
  let authReady = false;

  function libraryKey() { return uid ? LIBRARY_PREFIX + uid : null; }
  function readLibrary() {
    const key = libraryKey();
    if (!key) return { saved: [], folders: [] };
    try {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      return data && Array.isArray(data.saved) && Array.isArray(data.folders)
        ? data : { saved: [], folders: [] };
    } catch (_) { return { saved: [], folders: [] }; }
  }
  function get() { return readLibrary().saved.filter(id => typeof id === 'string'); }
  function save(ids) {
    const key = libraryKey();
    if (!key) return;
    try {
      const data = readLibrary();
      data.saved = [...new Set(ids)];
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) { console.warn('Could not save product', error); }
  }
  function toggle(id) {
    if (!uid || typeof id !== 'string' || !id) {
      if (authReady && !uid) {
        location.href = 'login.html?from=saved';
      }
      return false;
    }
    const previous = get();
    const next = previous.includes(id) ? previous.filter(item => item !== id) : [id, ...previous];
    save(next);
    window.dispatchEvent(new Event('vayen-saved-changed'));
    return next.includes(id);
  }
  function svg() {
    return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  }
  function heart(id) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vayen-save-heart';
    button.dataset.saveId = id;
    button.innerHTML = svg();
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggle(id);
    });
    return button;
  }
  function sync() {
    const ids = get();
    document.querySelectorAll('.vayen-save-heart').forEach(button => {
      const active = ids.includes(button.dataset.saveId);
      button.classList.toggle('is-saved', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? 'Remove from Saved' : 'Save product');
      button.title = active ? 'Remove from Saved' : 'Save product';
    });
  }
  function migrateLegacyForUser(id) {
    // Only migrate records explicitly keyed to this verified Firebase UID.
    const oldKey = LEGACY_PREFIX + id;
    try {
      const old = JSON.parse(localStorage.getItem(oldKey) || 'null');
      if (!Array.isArray(old)) return;
      const ids = old.filter(item => typeof item === 'string');
      if (ids.length) save([...get(), ...ids]);
      localStorage.removeItem(oldKey);
    } catch (_) { /* Leave invalid legacy data untouched. */ }
  }
  window.VayenSaved = { get, toggle, heart, sync, user: () => uid || 'guest' };
  window.addEventListener('vayen-saved-changed', sync);

  (async () => {
    try {
      const [{ initializeApp, getApps, getApp }, { getAuth, onAuthStateChanged }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js')
      ]);
      const config = window.VAYEN_FIREBASE_CONFIG;
      if (!config) throw new Error('VAYEN account configuration unavailable');
      const app = getApps().length ? getApp() : initializeApp(config);
      onAuthStateChanged(getAuth(app), user => {
        const nextUid = user?.uid || null;
        if (nextUid !== uid) {
          uid = nextUid;
          if (uid) migrateLegacyForUser(uid);
        }
        authReady = true;
        window.dispatchEvent(new Event('vayen-saved-changed'));
      }, error => {
        console.error('Saved account verification failed', error);
        uid = null;
        authReady = false;
        window.dispatchEvent(new Event('vayen-saved-changed'));
      });
    } catch (error) {
      console.error('Saved account initialization failed', error);
    }
  })();
})();
