// VAYEN shared authentication for Home and Profile.
// Configure your Firebase API key locally before deploying.
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, updateProfile, getIdTokenResult } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCJStLo-FmvkPQo-u-cP-J4rQ8z4ecYMW4",
  authDomain: "veyan-53930.firebaseapp.com",
  projectId: "veyan-53930",
  storageBucket: "veyan-53930.firebasestorage.app",
  messagingSenderId: "836801786398",
  appId: "1:836801786398:web:a73fbda60267efcdbd740f",
  measurementId: "G-2T5XNQGKTP"
};

const $ = id => document.getElementById(id);
const sessionKey = 'vayenDemoLoginSessionV1';
const accountKey = 'vayenDemoCurrentCustomerV1';
const parse = (key, storage) => {
  try { return JSON.parse(storage.getItem(key) || 'null'); }
  catch { return null; }
};
const first = s => String(s || '').trim().split(/\s+/)[0] || 'Member';
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(id);
const onProfile = !!$('vayenIdentityInput');
let currentUser = null;
let ready = false;
let profileLoading = false;
let profileLoadFailed = false;
let remoteNames = null;
let auth, db;
let authRevision = 0;

function showStatus(message) {
  const el = $('vayenProfileEditStatus');
  if (el) el.textContent = message;
}

function clearLegacy() {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(accountKey);
}

function syncLegacy(user) {
  if (!user) { clearLegacy(); return; }
  const old = parse(sessionKey, sessionStorage);
  const name = user.displayName || user.email?.split('@')[0] || 'Member';
  const data = {
    id: user.uid,
    name,
    email: user.email || '',
    provider: user.providerData?.[0]?.providerId || 'password',
    demo: false,
    loginAt: old?.id === user.uid ? old.loginAt : new Date().toISOString()
  };
  sessionStorage.setItem(sessionKey, JSON.stringify(data));
  localStorage.setItem(accountKey, JSON.stringify(data));
}

function nameFor(user) {
  return user?.displayName || user?.email?.split('@')[0] || 'Member';
}

function localNames(user) {
  return {
    dearName: localStorage.getItem('vayenHeaderName:' + user.uid) || first(nameFor(user))
  };
}

function namesFor(user) {
  return remoteNames || localNames(user);
}

async function loadProfile(user, isCurrent) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const fallback = localNames(user);
  // Sign-in method is obtained from the verified Firebase ID token.
  const token = await getIdTokenResult(user);
  if (!isCurrent()) return;
  const email = user.email || '';
  const loginMethod = token.claims.firebase?.sign_in_provider || 'unknown';
  if (snap.exists()) {
    const data = snap.data();
    const resolvedNames = {
      dearName: typeof data.dearName === 'string' && data.dearName.trim()
        ? data.dearName : fallback.dearName
    };
    if (!isCurrent()) return;
    remoteNames = resolvedNames;
    // Do not overwrite names or original account creation date.
    if (data.email !== email || data.loginMethod !== loginMethod) {
      await setDoc(ref, { email, loginMethod, updatedAt: serverTimestamp() }, { merge: true });
    }
  } else {
    if (!isCurrent()) return;
    remoteNames = fallback;
    await setDoc(ref, {
      fullName: nameFor(user),
      dearName: fallback.dearName,
      email,
      loginMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  if (isCurrent()) localStorage.setItem('vayenHeaderName:' + user.uid, remoteNames.dearName);
}

async function saveFields(fields) {
  if (!currentUser || !db || profileLoading) throw Error('Profile not ready');
  const uid = currentUser.uid;
  await setDoc(doc(db, 'users', uid), {
    ...fields,
    updatedAt: serverTimestamp()
  }, { merge: true });
  if (currentUser?.uid !== uid) return;
  if ('dearName' in fields) {
    remoteNames = { ...namesFor(currentUser), dearName: fields.dearName };
    localStorage.setItem('vayenHeaderName:' + uid, fields.dearName);
  }
}

function syncHome(user) {
  const link = $('headerSignIn');
  const account = $('vayenHeaderAccount');
  if (link) {
    if (user) {
      const dear = namesFor(user).dearName;
      link.textContent = 'Dear ' + dear;
      link.removeAttribute('href');
      link.classList.add('vayen-signed-in-name');
    } else {
      link.innerHTML = '<span class="signin-dot"></span> Sign in';
      link.href = 'login.html';
      link.classList.remove('vayen-signed-in-name');
    }
  }
  if (account) account.hidden = !user;
}

function syncProfile(user) {
  if (!onProfile) return;
  if (!user) { location.replace('login.html'); return; }
  const full = nameFor(user);
  const dear = namesFor(user).dearName;
  const set = (id, value) => {
    const el = $(id);
    if (el) ('value' in el ? el.value = value : el.textContent = value);
  };
  set('vayenIdentityInput', full);
  set('vayenHeaderInput', dear);
  set('vayenSummaryName', full);
  set('vayenSummaryEmail', user.email || '—');
  set('profileAccountEmail', user.email || '—');
  set('profileAccountName', full);
  set('vyHeaderName', full);
  const initial = first(full).charAt(0).toUpperCase();
  set('vyHeaderAvatar', initial);
  const avatar = document.querySelector('.vayen-avatar');
  if (avatar) avatar.textContent = initial;
  const joined = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : '—';
  set('profileMemberSince', joined);
  set('vyJoinedDate', joined);
}

function bindProfile() {
  if (!onProfile) return;

  $('vayenSaveIdentity')?.addEventListener('click', async () => {
    if (!currentUser || profileLoading) {
      return showStatus(profileLoadFailed ? 'Account details are temporarily unavailable. Please refresh and try again.' : 'Your profile is loading. Please wait a moment.');
    }
    const name = $('vayenIdentityInput').value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) return showStatus('Please enter your full name.');
    const user = currentUser;
    const revision = authRevision;
    try {
      await updateProfile(user, { displayName: name });
      if (authRevision !== revision || currentUser?.uid !== user.uid) return;
      syncLegacy(user);
      syncProfile(user);
      try {
        await saveFields({ fullName: name });
        if (authRevision === revision && currentUser?.uid === user.uid) {
          showStatus('✓ Changes saved successfully.');
        }
      } catch (syncError) {
        console.error('VAYEN account name sync failed:', syncError);
        if (authRevision === revision && currentUser?.uid === user.uid) {
          showStatus('Your name was updated, but account syncing is incomplete. Please tap Save again.');
        }
      }
    } catch (e) {
      console.error(e);
      if (authRevision === revision && currentUser?.uid === user.uid) {
        showStatus('Unable to save changes. Please try again.');
      }
    }
  });

  $('vayenSaveHeader')?.addEventListener('click', async () => {
    if (!currentUser || profileLoading) {
      return showStatus(profileLoadFailed ? 'Account details are temporarily unavailable. Please refresh and try again.' : 'Your profile is loading. Please wait a moment.');
    }
    const name = $('vayenHeaderInput').value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) return showStatus('Please enter at least 2 characters.');
    const uid = currentUser.uid;
    const revision = authRevision;
    try {
      await saveFields({ dearName: name });
      if (authRevision === revision && currentUser?.uid === uid) {
        showStatus('✓ Changes saved successfully.');
      }
    } catch (e) {
      console.error(e);
      if (authRevision === revision && currentUser?.uid === uid) {
        showStatus('Unable to save changes. Please try again.');
      }
    }
  });

  document.querySelectorAll('[data-vy-logout]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      if (!confirm('Log out of VAYEN?')) return;
      btn.disabled = true;
      try {
        await signOut(auth);
        clearLegacy();
        location.replace('index.html');
      } catch (e) {
        console.error(e);
        btn.disabled = false;
        showStatus('Unable to log out. Please try again.');
      }
    });
  });

  $('vyAvatarButton')?.addEventListener('click', () => {
    alert('Profile photo updates are not available yet.');
  });
}

// Preserve product checkout routing while persistent authentication is restored.
document.addEventListener('click', async e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  const product = url.searchParams.get('product');
  const page = url.pathname.split('/').pop().toLowerCase();
  if (!validId(product) || !['payment.html', 'login.html'].includes(page)) return;
  if (page === 'login.html' && url.searchParams.get('from') !== 'get') return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!ready) {
    await new Promise(resolve => {
      const start = Date.now();
      const timer = setInterval(() => {
        if (ready || Date.now() - start > 6000) {
          clearInterval(timer);
          resolve();
        }
      }, 40);
    });
  }
  location.assign(currentUser
    ? 'payment.html?product=' + encodeURIComponent(product)
    : 'login.html?from=get&product=' + encodeURIComponent(product));
}, true);

bindProfile();

if (!firebaseConfig.apiKey) {
  console.warn('VAYEN authentication configuration is incomplete.');
  ready = true;
  clearLegacy();
  syncHome(null);
  if (onProfile) location.replace('login.html');
} else {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, async user => {
      const revision = ++authRevision;
      currentUser = user;
      if (onProfile) document.documentElement.classList.remove('vayen-profile-auth-verified');
      ready = false;
      remoteNames = null;
      profileLoading = !!user;
      profileLoadFailed = false;
      syncLegacy(user);
      if (!user) {
        ready = true;
        syncHome(null);
        syncProfile(null);
        return;
      }
      try {
        await loadProfile(user, () => authRevision === revision && currentUser?.uid === user.uid);
      } catch (e) {
        console.error('Profile loading failed:', e);
        if (authRevision !== revision || currentUser?.uid !== user.uid) return;
        showStatus('Some account details could not be loaded. Please refresh and try again.');
        remoteNames = localNames(user);
        profileLoadFailed = true;
      }
      if (authRevision !== revision || currentUser?.uid !== user.uid) return;
      profileLoading = false;
      syncHome(user);
      syncProfile(user);
      ready = true;
      if (onProfile) document.documentElement.classList.add('vayen-profile-auth-verified');
    }, err => {
      console.error(err);
      ++authRevision;
      currentUser = null;
      remoteNames = null;
      profileLoading = false;
      profileLoadFailed = false;
      clearLegacy();
      ready = true;
      syncHome(null);
      showStatus('Unable to verify your account. Please refresh and try again.');
      if (onProfile) location.replace('login.html');
    });
  } catch (e) {
    console.error(e);
    ready = true;
    syncHome(null);
    showStatus('Unable to connect. Please refresh and try again.');
    if (onProfile) location.replace('login.html');
  }
}
