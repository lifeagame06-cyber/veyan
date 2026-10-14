 // VAYEN shared Firebase authentication for Home and Profile.
// Fill apiKey here AND in login.html locally before uploading.
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
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
const $=id=>document.getElementById(id);
const sessionKey='vayenDemoLoginSessionV1';
const accountKey='vayenDemoCurrentCustomerV1';
const parse=(key,storage)=>{try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}};
const first=s=>String(s||'').trim().split(/\s+/)[0]||'Member';
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(id);
const onProfile=!!$('vayenIdentityInput');
let currentUser=null,ready=false,profileLoading=false,remoteNames=null;
let auth,db;
function showStatus(msg){const el=$('vayenProfileEditStatus');if(el)el.textContent=msg}
function clearLegacy(){sessionStorage.removeItem(sessionKey);localStorage.removeItem(accountKey)}
function syncLegacy(user){
 if(!user){clearLegacy();return}
 const old=parse(sessionKey,sessionStorage);
 const name=user.displayName||user.email?.split('@')[0]||'Member';
 const data={id:user.uid,name,email:user.email||'',provider:user.providerData?.[0]?.providerId||'password',demo:false,loginAt:old?.id===user.uid?old.loginAt:new Date().toISOString()};
 sessionStorage.setItem(sessionKey,JSON.stringify(data));
 localStorage.setItem(accountKey,JSON.stringify(data));
}
function localNames(user){return {dearName:localStorage.getItem('vayenHeaderName:'+user.uid)||first(nameFor(user)),welcomeName:localStorage.getItem('vayenCardName:'+user.uid)||first(nameFor(user))}}
function namesFor(user){return remoteNames||localNames(user)}
async function loadProfile(user){
 const ref=doc(db,'users',user.uid);
 const snap=await getDoc(ref);
 const fallback=localNames(user);
 if(snap.exists()){
  const data=snap.data();
  remoteNames={dearName:typeof data.dearName==='string'&&data.dearName.trim()?data.dearName:fallback.dearName,welcomeName:typeof data.welcomeName==='string'&&data.welcomeName.trim()?data.welcomeName:fallback.welcomeName};
 }else{
  remoteNames=fallback;
  await setDoc(ref,{fullName:nameFor(user),dearName:fallback.dearName,welcomeName:fallback.welcomeName,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
 }
 // Account-scoped cache is only a display fallback, not the source of truth.
 localStorage.setItem('vayenHeaderName:'+user.uid,remoteNames.dearName);
 localStorage.setItem('vayenCardName:'+user.uid,remoteNames.welcomeName);
}
async function saveFields(fields){
 if(!currentUser||!db||profileLoading)throw Error('Profile not ready');
 const uid=currentUser.uid;
 await setDoc(doc(db,'users',uid),{...fields,updatedAt:serverTimestamp()},{merge:true});
 if(currentUser?.uid!==uid)return;
 if('dearName'in fields){remoteNames={...namesFor(currentUser),dearName:fields.dearName};localStorage.setItem('vayenHeaderName:'+uid,fields.dearName)}
 if('welcomeName'in fields){remoteNames={...namesFor(currentUser),welcomeName:fields.welcomeName};localStorage.setItem('vayenCardName:'+uid,fields.welcomeName)}
}
function nameFor(user){return user?.displayName||user?.email?.split('@')[0]||'Member'}
function syncHome(user){
 const link=$('headerSignIn'),account=$('vayenHeaderAccount');
 if(link){
  if(user){const dear=namesFor(user).dearName;link.textContent='Dear '+dear;link.href='profile.html';link.classList.add('vayen-signed-in-name')}
  else{link.innerHTML='<span class="signin-dot"></span> Sign in';link.href='login.html';link.classList.remove('vayen-signed-in-name')}
 }
 if(account)account.hidden=!user;
 const welcome=$('homeWelcome');
 if(welcome&&user){const name=namesFor(user).welcomeName;const person=welcome.querySelector('.welcome-person');if(person)person.textContent=name+'.'}
}
function syncProfile(user){
 if(!onProfile)return;
 if(!user){location.replace('login.html');return}
 const full=nameFor(user),dear=namesFor(user).dearName,card=namesFor(user).welcomeName;
 const set=(id,val)=>{const el=$(id);if(el)('value'in el?el.value=val:el.textContent=val)};
 set('vayenIdentityInput',full);set('vayenHeaderInput',dear);set('profileWelcomeName',card);
 set('profileNamePreview',card+'.');set('vayenSummaryName',full);set('vayenSummaryEmail',user.email||'—');
 set('profileAccountEmail',user.email||'—');set('profileAccountName',full);set('vyHeaderName',full);
 const initial=first(full).charAt(0).toUpperCase();set('vyHeaderAvatar',initial);
 const avatar=document.querySelector('.vayen-avatar');if(avatar)avatar.textContent=initial;
 const joined=user.metadata?.creationTime?new Date(user.metadata.creationTime).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—';
 set('profileMemberSince',joined);set('vyJoinedDate',joined);
}
function bindProfile(){
 if(!onProfile)return;
 $('vayenSaveIdentity')?.addEventListener('click',async()=>{
  if(!currentUser||profileLoading)return showStatus('Wait for Firebase profile to load.');
  const name=$('vayenIdentityInput').value.trim().replace(/\s+/g,' ');
  if(name.length<2)return showStatus('Enter your full name.');
  try{await updateProfile(currentUser,{displayName:name});await saveFields({fullName:name});syncLegacy(currentUser);syncProfile(currentUser);showStatus('Full identity name saved to Firebase. Dear name and welcome card stay unchanged.')}
  catch(e){showStatus('Could not save full name. Please try again.')}
 });
 $('vayenSaveHeader')?.addEventListener('click',async()=>{
  if(!currentUser||profileLoading)return showStatus('Wait for Firebase profile to load.');
  const name=$('vayenHeaderInput').value.trim().replace(/\s+/g,' ');
  if(name.length<2)return showStatus('Enter a name of at least 2 characters.');
  try{await saveFields({dearName:name});showStatus('Homepage Dear name saved to Firebase.')}catch(e){showStatus('Could not save Dear name. Check connection and try again.');console.error(e)}
 });
 $('profileWelcomeName')?.addEventListener('input',()=>{const n=$('profileWelcomeName').value.trim();$('profileNamePreview').textContent=(n||'Sir')+'.'});
 $('saveProfileName')?.addEventListener('click',async()=>{
  if(!currentUser||profileLoading)return showStatus('Wait for Firebase profile to load.');
  const n=$('profileWelcomeName').value.trim();if(!n)return showStatus('Enter a welcome name.');
  try{await saveFields({welcomeName:n})}catch(e){showStatus('Could not save Welcome name. Check connection and try again.');console.error(e);return} $('profileNamePreview').textContent=n+'.';
  const btn=$('saveProfileName');btn.textContent='Saved ✓';setTimeout(()=>btn.textContent='Save changes →',1600);
 });
 document.querySelectorAll('[data-vy-logout]').forEach(btn=>btn.addEventListener('click',async e=>{
  e.preventDefault();if(!confirm('Log out of VAYEN?'))return;
  btn.disabled=true;
  try{await signOut(auth);clearLegacy();location.replace('index.html')}
  catch(e){btn.disabled=false;showStatus('Logout failed. Please try again.')}
 }));
 $('vyAvatarButton')?.addEventListener('click',()=>alert('Avatar upload will be available when account storage is connected. Your current initial is kept.'));
}
// Capture payment links while Firebase restores persistent auth, never trust a demo session for login decisions.
document.addEventListener('click',async e=>{
 const a=e.target.closest('a[href]');if(!a)return;
 const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;
 const product=url.searchParams.get('product'),page=url.pathname.split('/').pop().toLowerCase();
 if(!validId(product)||!['payment.html','login.html'].includes(page))return;
 if(page==='login.html'&&url.searchParams.get('from')!=='get')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!ready){await new Promise(resolve=>{const start=Date.now();const timer=setInterval(()=>{if(ready||Date.now()-start>6000){clearInterval(timer);resolve()}},40)})}
 location.assign(currentUser?'payment.html?product='+encodeURIComponent(product):'login.html?from=get&product='+encodeURIComponent(product));
},true);
bindProfile();
if(!firebaseConfig.apiKey){
 console.warn('VAYEN Firebase API key missing in vayen-auth-sync.js');
 ready=true;clearLegacy();syncHome(null);if(onProfile)showStatus('Add Firebase API key in vayen-auth-sync.js.');
}else{
 try{
  const app=getApps().length?getApp():initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
  onAuthStateChanged(auth,async user=>{
  currentUser=user;remoteNames=null;profileLoading=!!user;syncLegacy(user);
  if(!user){ready=true;syncHome(null);syncProfile(null);return}
  try{await loadProfile(user)}catch(e){console.error('Firestore profile load failed:',e);showStatus('Could not sync profile with Firebase. Check connection and refresh.');remoteNames=localNames(user)}
  if(currentUser?.uid!==user.uid)return;
  profileLoading=false;syncHome(user);syncProfile(user);ready=true;
},err=>{console.error(err);currentUser=null;ready=true;syncHome(null);showStatus('Could not verify account. Refresh and try again.')});
 }catch(e){console.error(e);ready=true;syncHome(null);showStatus('Firebase initialization failed. Check your API key.')}
}
