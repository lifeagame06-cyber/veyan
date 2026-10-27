(function(){'use strict';
const params=new URLSearchParams(location.search);const id=params.get('id')||params.get('product')||'ai-prompt-box';
const themes={
'youtube-creator-system':['#ffc15c','#ec2738','rgba(235,48,48,.22)','🎬'],
'vlogging-mastery':['#ffb37a','#e97434','rgba(255,135,66,.24)','📹'],
'animation-mastery':['#c3a2ff','#8244d8','rgba(154,93,235,.24)','🎞'],
'social-media-tips':['#ff86aa','#c83265','rgba(245,83,145,.24)','📱'],
'ai-prompt-box':['#a78bfa','#6b44e9','rgba(112,72,250,.28)','✦'],
'build-your-own-ai':['#67e5d3','#198b99','rgba(64,217,199,.23)','🤖'],
'reels-growth':['#ff90bb','#d83f83','rgba(245,73,153,.23)','🎥'],
'web-creator':['#80cbff','#3684ce','rgba(60,140,240,.23)','🌐'],
'youtube-algorithm':['#ff8e80','#d52c39','rgba(230,65,75,.23)','▶'],
'earn-from-social-media':['#81dfb0','#268c64','rgba(62,202,133,.23)','₹'],
'creator-studio':['#ffc18c','#bc713b','rgba(231,151,82,.23)','🎙'],
'business-launch':['#ffcd77','#aa762e','rgba(224,167,71,.23)','🚀'],
'content-strategy':['#bbaaff','#7864c8','rgba(147,120,228,.23)','▦'],
'design-thumbnails':['#ff9edb','#cb4eac','rgba(240,95,185,.23)','🎨'],
'edit-videos':['#89c6ff','#447ad8','rgba(94,156,243,.23)','🎬'],
'ai-automation':['#70dfd9','#258e97','rgba(65,207,200,.23)','⚡'],
'seller-commerce':['#eeb779','#b77a37','rgba(226,154,76,.23)','🛍'],
'personal-brand':['#dba3ff','#8f58c6','rgba(181,104,229,.23)','★']};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
const startedAt=Date.now();
function wait(){
  if(document.body.classList.contains('vayen-product-ready')){
    try{init()}catch(error){console.error('VAYEN product layout could not initialize',error);document.body.classList.remove('vayen-approved');}
    return;
  }
  if(Date.now()-startedAt>15000){
    const skeleton=document.getElementById('vayen-product-skeleton');
    if(skeleton){skeleton.textContent='This product is taking longer to load. Please refresh the page.';skeleton.style.visibility='visible';skeleton.style.opacity='1';}
    document.body.style.visibility='visible';
    return;
  }
  setTimeout(wait,70);
}
function init(){const main=document.querySelector('.product-page');if(!main||main.querySelector('.ap-hero'))return;
const title=document.querySelector('.product-detail-title')?.textContent.trim()||'Digital Product';const category=document.querySelector('.product-category')?.textContent.trim()||'VAYEN GUIDE';const subtitle=document.querySelector('.product-confidence')?.textContent.trim()||'';
const points=[...document.querySelectorAll('.product-detail-points p')].map(e=>e.textContent.trim());const contents=[...document.querySelectorAll('.product-content-item')].map(e=>({tag:e.querySelector('small')?.textContent.trim()||'GUIDE',title:e.querySelector('h3')?.textContent.trim()||'',desc:e.querySelector('p')?.textContent.trim()||''}));
const steps=[...document.querySelectorAll('.product-step')].map(e=>({title:e.querySelector('h3')?.textContent.trim()||'',desc:e.querySelector('p')?.textContent.trim()||''}));const previews=[...document.querySelectorAll('.product-preview-card')].map(e=>({title:e.querySelector('h3')?.textContent.trim()||'',desc:e.querySelector('p')?.textContent.trim()||''}));const audience=document.querySelector('.product-quick-info > div:nth-child(3) strong')?.textContent.trim()||'Learners';const price=document.querySelector('.product-price strong')?.textContent.trim()||'Price coming soon';const sourceBuy=document.querySelector('.product-purchase a.product-get');const buyHref=sourceBuy?.getAttribute('href');const coming=!buyHref||sourceBuy?.getAttribute('aria-disabled')==='true';const theme=themes[id]||['#ff9dc8','#ab4678','rgba(224,86,153,.24)','✦'];
document.body.classList.add('vayen-approved');document.body.dataset.apProduct=id;document.body.dataset.vayenProduct=id;const header=document.querySelector('.product-header');if(header&&!header.querySelector('.ap-header-nav')){const nav=el('nav','ap-header-nav');[['Home','index.html'],['Collection','collection.html']].forEach(([name,url])=>{const link=el('a','',name);link.href=url;nav.append(link)});const brand=header.querySelector('.product-brand');brand?.after(nav)}document.body.style.setProperty('--ap-accent',theme[0]);document.body.style.setProperty('--ap-edge',theme[1]);document.body.style.setProperty('--ap-glow',theme[2]);
const originalCover=document.querySelector('.product-visual');const coverBackground=originalCover?.style.background||'';const coverMatch=coverBackground.match(/url\(["']?([^"')]+)["']?\)/);const premiumCoverPaths = {
    "animation-mastery": "images/product-covers/animation-mastery.png",
    "social-media-tips": "images/product-covers/social-media-tips.png",
    "ai-prompt-box": "images/product-covers/ai-prompt-box.png",
    "build-your-own-ai": "images/product-covers/build-your-own-ai.png",
    "claude-ai-youtube-autopilot": "images/product-covers/claude-ai-youtube-autopilot.png",
    "trading-strategy-masterclass": "images/product-covers/trading-strategy-masterclass.png"
};
const coverSrc = premiumCoverPaths[id] || coverMatch?.[1] || null;const coverTop=originalCover?.querySelector('.product-visual-top small')?.textContent.trim()||'VAYEN / '+title.toUpperCase();const coverBottom=originalCover?.querySelector('.product-visual-bottom span:first-child')?.textContent.trim()||'LEARN · CREATE · GROW';
const mainContent=document.createDocumentFragment();const crumb=el('div','ap-breadcrumb');crumb.innerHTML='<a href="index.html">Home</a><span>›</span><a href="collection.html">Collection</a><span>›</span>';crumb.append(el('b','',title));mainContent.append(crumb);
const hero=el('section','ap-hero');hero.id='ap-overview';const media=el('div','ap-media');const cover=el('div','ap-cover');const coverLabel=el('span','ap-cover-label',coverTop);const coverCaption=el('span','ap-cover-bottom',coverBottom);const coverFallback=el('div','ap-cover-fallback',title);const coverImg=el('img');coverImg.alt=title+' cover';coverImg.loading='eager';if(coverSrc){coverImg.src=coverSrc;coverImg.onerror=()=>{if(premiumCoverPaths[id])cover.classList.add("ap-image-missing");coverImg.remove();cover.append(coverFallback)};cover.append(coverImg)}else cover.append(coverFallback);cover.append(coverLabel,coverCaption);const coverPrev=el('button','ap-cover-arrow prev','‹'),coverNext=el('button','ap-cover-arrow next','›');coverPrev.type=coverNext.type='button';coverPrev.setAttribute('aria-label','Previous preview');coverNext.setAttribute('aria-label','Next preview');cover.append(coverPrev,coverNext);media.append(cover);const thumbs=el('div','ap-thumbs');media.append(thumbs);
// Desktop-only information panel for the six Premium products.
// Reuse actual product topics already loaded from the page.
const premiumPanelIds = new Set([
    'animation-mastery',
    'social-media-tips',
    'ai-prompt-box',
    'build-your-own-ai',
    'claude-ai-youtube-autopilot',
    'trading-strategy-masterclass'
]);

if (premiumPanelIds.has(id)) {
    const topics = [...new Set(
        (contents.length ? contents.map(item => item.title) : points)
            .map(item => item.trim())
            .filter(Boolean)
    )].slice(0, 4);

    if (topics.length) {
        const panel = el('section', 'ap-premium-inside');
        const heading = el('div', 'ap-premium-inside-heading');
        heading.append(
            el('span', 'ap-premium-inside-kicker', 'INSIDE THIS GUIDE'),
            el('h2', '', 'What You’ll Explore')
        );
        panel.append(heading);

        const topicList = el('ul', 'ap-premium-inside-topics');
        topics.forEach(topic => {
            topicList.append(el('li', '', topic));
        });
        panel.append(topicList);
        media.append(panel);
    }
}
hero.append(media);
const info=el('section','ap-info');const heading=el('div','ap-heading'),headLeft=el('div');headLeft.append(el('span','ap-category',category),el('h1','ap-title',title),el('p','ap-subtitle',subtitle||'Explore practical, step-by-step guidance and clear examples.'));const priceBox=el('div','ap-price',price);heading.append(headLeft,priceBox);info.append(heading);
if(id==='ai-prompt-box'){const badge=el('div','ap-ai-count','3,000+ READY-TO-USE PROMPTS · COPY • CUSTOMISE • GENERATE');headLeft.append(badge);const exampleNote=el('p','ap-ai-use','Not sure what to type into AI? Pick a ready-made prompt, add your topic, and generate your first draft.');headLeft.append(exampleNote)}const slides=contents.length?contents.slice(0,4):points.slice(0,4).map((p,i)=>({tag:'STEP '+(i+1),title:p,desc:p}));if(!slides.length)slides.push({tag:'VAYEN',title:'Explore this guide',desc:'Discover practical learning resources.'});const slider=el('section','ap-slider');slider.setAttribute('aria-label','Automatic learning topics');const top=el('div','ap-slider-top'),counter=el('span'),dots=el('div','ap-dots'),timerLabel=el('span','',''),pause=el('button','ap-pause','Ⅱ');pause.type='button';pause.setAttribute('aria-label','Pause automatic slides');top.append(counter,dots,pause);slider.append(top);const slideContent=el('div','ap-slide-content'),slideIcon=el('div','ap-slide-icon',theme[3]),slideText=el('div','ap-slide-text'),slideTitle=el('h2'),slideDesc=el('p'),art=el('div','ap-slide-art'),artText=el('div'),artSymbol=el('b','',theme[3]),artCaption=el('span');artText.append(artCaption);art.append(artText);slideText.append(slideTitle,slideDesc);slideContent.append(slideIcon,slideText,art);slider.append(slideContent);info.append(slider);
const benefits=el('div','ap-benefits');[['◉','Step-by-step guidance'],['▤','Easy-to-follow examples'],['∞','Practical workflow'],['✓','Learn at your pace']].forEach(([ico,label])=>{const b=el('div','ap-benefit');b.append(el('i','',ico),el('span','',label));benefits.append(b)});info.append(benefits);
const actions=el('div','ap-actions');const buy=el('a','ap-buy');
function syncBuy(){
  if(!sourceBuy){buy.textContent='Currently unavailable';buy.removeAttribute('href');buy.setAttribute('aria-disabled','true');return;}
  const href=sourceBuy.getAttribute('href');
  const disabled=sourceBuy.getAttribute('aria-disabled')==='true';
  const owned=disabled && /owned|purchased/i.test(sourceBuy.textContent||'');
  if(owned){buy.textContent='Owned ✓';buy.removeAttribute('href');buy.setAttribute('aria-disabled','true');return;}
  if(disabled||!href){buy.textContent='Coming Soon';buy.removeAttribute('href');buy.setAttribute('aria-disabled','true');return;}
  buy.textContent='Get Now — '+price+' →';buy.href=href;buy.removeAttribute('aria-disabled');
}
syncBuy();
if(sourceBuy){new MutationObserver(syncBuy).observe(sourceBuy,{attributes:true,attributeFilter:['href','aria-disabled'],childList:true,subtree:true,characterData:true});}
const save=el('button','ap-save','♡ Save');save.type='button';save.addEventListener('click',()=>{if(window.VayenSaved){const saved=window.VayenSaved.toggle(id);save.textContent=saved?'♥ Saved':'♡ Save';save.setAttribute('aria-pressed',String(saved))}});if(window.VayenSaved){const saved=window.VayenSaved.get().includes(id);save.textContent=saved?'♥ Saved':'♡ Save';save.setAttribute('aria-pressed',String(saved))}actions.append(buy,save);info.append(actions);
const editions=el('div','ap-editions');[['▤','English PDF','English edition'],['अ','Roman Hinglish PDF','Hindi in English letters']].forEach(([ico,label,desc])=>{const c=el('div','ap-edition'),text=el('div');text.append(el('b','',label),el('small','',desc));c.append(el('i','',ico),text);editions.append(c)});info.append(editions);hero.append(info);mainContent.append(hero);
const tabs=el('nav','ap-tabs');tabs.setAttribute('aria-label','Product details');[['Overview','#ap-overview'],["What’s Inside",'#ap-inside'],['Examples','#ap-examples'],["Who It’s For",'#ap-audience'],['How It Works','#ap-workflow'],['FAQ','#ap-faq']].forEach(([label,href])=>{const a=el('a','',label);a.href=href;a.addEventListener('click',event=>{event.preventDefault();tabs.querySelectorAll('a').forEach(x=>x.classList.remove('active'));a.classList.add('active');const target=document.querySelector(href);if(target){document.querySelectorAll('.ap-target-highlight').forEach(x=>x.classList.remove('ap-target-highlight'));target.classList.add('ap-target-highlight');target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});history.replaceState(null,'',href)}});if(href==='#ap-overview')a.classList.add('active');tabs.append(a)});mainContent.append(tabs);
const cards=el('div','ap-cards');function card(title,icon,id){const c=el('section','ap-card');c.id=id;const h=el('h3');h.append(el('i','',icon),document.createTextNode(title));c.append(h);cards.append(c);return c}function list(c,items){const ul=el('ul');items.forEach(x=>ul.append(el('li','',x)));c.append(ul)}
const learn=card(id==='ai-prompt-box'?'What You Can Do With 3,000+ Prompts':"What You'll Learn",'◎','ap-learn');learn.append(el('p','ap-card-intro',id==='ai-prompt-box'?'No prompt-writing experience? Here is what you can do with this ready-made collection.':'Starting from zero? These are the skills this guide helps you understand, one step at a time.'));list(learn,points.slice(0,8));const inside=card(id==='ai-prompt-box'?'How the Prompt Collection Works':"What's Inside the Guide",'▤','ap-inside');inside.append(el('p','ap-card-intro',id==='ai-prompt-box'?'Not another complicated AI course: choose, copy, customise and generate.':'A simple look at the topics covered, so you know what you are exploring before you get it.'));list(inside,contents.map(x=>x.title));const example=card(id==='ai-prompt-box'?'Example: From Prompt to Result':'Example: From Idea to Action','▧','ap-examples'),ex=el('div','ap-example');example.append(el('p','ap-card-intro',id==='ai-prompt-box'?'Need an Instagram caption? See how one ready-made prompt becomes a useful result.':'See how one small idea becomes something you can actually create.'));if(id==='ai-prompt-box'){
  // Compact real example; do not stretch all four overview cards.
  ex.classList.add('ap-prompt-demo','ap-prompt-compact');
  const promptBox=el('div','ap-prompt-panel');
  promptBox.append(el('span','ap-demo-eyebrow','01 · COPY THIS PROMPT'),el('p','','“Write a friendly Instagram caption for my [product].”'));
  ex.append(promptBox);
  const customise=el('div','ap-prompt-customise');
  customise.append(el('span','ap-demo-eyebrow','02 · ADD YOUR PRODUCT'),el('p','','[product] → handmade candles'));
  ex.append(customise);
  const result=el('div','ap-prompt-result');
  result.append(el('span','ap-demo-eyebrow','03 · EXAMPLE RESULT'),el('p','','“Make someone’s day brighter 🕯️ Explore our handmade candles!”'));
  ex.append(result);
}else{
  (steps.length?steps:previews).slice(0,4).forEach((s,i)=>{
    const st=el('div','ap-example-step');
    st.append(el('b','',String(i+1).padStart(2,'0')),el('span','',s.title));
    ex.append(st);
  });
}
example.append(ex);const perfect=card('Perfect For','♧','ap-audience');const audienceList=[audience,'Beginners who want a clear starting point','People who learn best through practical examples','Creators who want to improve one step at a time'];perfect.append(el('p','ap-card-intro','No need to be an expert to begin. This guide is designed for people building confidence and practical skills.'));list(perfect,[...new Set(audienceList)]);cards.append();mainContent.append(cards);
const more=el('div','ap-more'),workflow=el('section','ap-card'),faq=el('section','ap-card');workflow.id='ap-workflow';faq.id='ap-faq';workflow.append(el('h3','','How It Works'),el('p','ap-card-intro','Follow these steps in order, then come back whenever you need a quick reminder.'));const workflowList=el('ol','ap-workflow-list');steps.forEach((step,i)=>{const li=el('li');li.append(el('span','ap-step-number',String(i+1).padStart(2,'0')),el('div','ap-step-copy'));li.lastChild.append(el('strong','',step.title),el('p','',step.desc));workflowList.append(li)});if(!steps.length)workflowList.append(el('li','','Explore the learning topics and examples above.'));workflow.append(workflowList);faq.append(el('h3','','Frequently Asked Questions'));const questions=[['Is this a physical product?','No. This is a digital learning resource.'],['Which languages are shown?','English and Roman Hinglish (Hindi written using English letters).'],['Where do I access my purchase?',coming?'This product is not available for purchase yet.':'Open Your Library after your purchase to check the files available to you.']];questions.forEach(([q,a])=>{const detail=el('details','ap-faq-item');detail.append(el('summary','',q),el('p','',a));faq.append(detail)});more.append(workflow,faq);mainContent.append(more);
main.replaceChildren(mainContent);
let index=0,paused=false,interval;const dotEls=slides.map(()=>{const d=el('span');dots.append(d);return d});function render(i){index=(i+slides.length)%slides.length;const s=slides[index];counter.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');slideTitle.textContent=s.title;slideDesc.textContent=s.desc;artCaption.textContent=s.title;dotEls.forEach((d,j)=>d.classList.toggle('active',j===index));[...thumbs.children].forEach((b,j)=>b.classList.toggle('active',j===index%4))}function start(){clearInterval(interval);if(!paused&&!matchMedia('(prefers-reduced-motion: reduce)').matches)interval=setInterval(()=>{if(!document.hidden)render(index+1)},4500)}
const thumbNames=['',...slides.slice(0,3).map(s=>s.title)];for(let i=0;i<4;i++){const b=el('button','ap-thumb');b.type='button';if(i===0&&coverSrc){const img=el('img');img.src=coverSrc;img.alt='';b.append(img)}if(i>0)b.append(el('span','',thumbNames[i]||'Preview'));else b.classList.add('ap-cover-thumb');b.setAttribute('aria-label','View '+(thumbNames[i]||'preview'));b.addEventListener('click',()=>{render(i);start()});thumbs.append(b)}
coverPrev.addEventListener('click',()=>{render(index-1);start()});coverNext.addEventListener('click',()=>{render(index+1);start()});pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Resume automatic slides':'Pause automatic slides');start()});let touch=null;slider.addEventListener('touchstart',e=>{touch=e.touches[0]?.clientX??null},{passive:true});slider.addEventListener('touchend',e=>{if(touch===null)return;const dx=(e.changedTouches[0]?.clientX??touch)-touch;if(Math.abs(dx)>40){render(index+(dx<0?1:-1));start()}touch=null},{passive:true});render(0);start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();