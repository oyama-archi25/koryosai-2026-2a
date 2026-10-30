// Observer runs only at the example boundary; no scroll-time geometry loop.
(()=>{
 const card=document.querySelector('.target-card'),sentinel=document.querySelector('.target-sentinel');
 if('IntersectionObserver' in window){let observer;const header=document.querySelector('.header');const observe=()=>{const top=header.getBoundingClientRect().height+8;observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const entry of entries)card.classList.toggle('is-compact',!entry.isIntersecting&&entry.boundingClientRect.top<top);},{rootMargin:`-${top}px 0px 0px 0px`,threshold:0});observer.observe(sentinel);};observe();if('ResizeObserver' in window)new ResizeObserver(observe).observe(header);}
 let contrast=false,colors=false;
 const contrastButton=document.querySelector('#contrast-toggle'),colorButton=document.querySelector('#color-help');
 window.updateViewLabels=()=>{contrastButton.textContent=siteLanguage==='en'?translations.en[contrast?'contrastOn':'contrastOff']:`くっきり：${contrast?'入':'切'}`;colorButton.textContent=siteLanguage==='en'?translations.en[colors?'colorHelpOn':'colorHelpOff']:`色名ヒント：${colors?'入':'切'}`;};
 contrastButton.addEventListener('click',()=>{contrast=!contrast;document.body.classList.toggle('high-contrast',contrast);contrastButton.setAttribute('aria-pressed',String(contrast));updateViewLabels();});
 colorButton.addEventListener('click',()=>{colors=!colors;document.body.classList.toggle('show-color-labels',colors);colorButton.setAttribute('aria-pressed',String(colors));updateViewLabels();});
 updateViewLabels();
})();

// Native dialog supplies focus trapping and Escape; load only on demand.
(()=>{
 const dialog=document.querySelector('#floor-dialog'),image=document.querySelector('#floor-plan'),mapHit=document.querySelector('#techno-hit'),button=document.querySelector('#floor-open');let opener=button;
 mapHit.setAttribute('role','button');mapHit.setAttribute('tabindex','0');mapHit.setAttribute('aria-haspopup','dialog');mapHit.setAttribute('aria-controls','floor-dialog');
 const ns='http://www.w3.org/2000/svg',hit=document.createElementNS(ns,'rect');
 for(const [k,v]of Object.entries({x:'692',y:'308',width:'136',height:'136',fill:'transparent','pointer-events':'all'}))hit.setAttribute(k,v);
 mapHit.insertBefore(hit,mapHit.firstChild);
 const marker=document.createElementNS(ns,'g');marker.setAttribute('aria-hidden','true');marker.setAttribute('pointer-events','none');
 const circle=document.createElementNS(ns,'circle');for(const [k,v]of Object.entries({cx:'792',cy:'338',r:'10',fill:'#fffdf7',stroke:'#25212a','stroke-width':'1.5'}))circle.setAttribute(k,v);
 const plus=document.createElementNS(ns,'path');for(const [k,v]of Object.entries({d:'M786 338H798M792 332V344',fill:'none',stroke:'#25212a','stroke-width':'2'}))plus.setAttribute(k,v);marker.append(circle,plus);mapHit.append(marker);
 window.updateFloorLabels=()=>{const en=siteLanguage==='en';mapHit.setAttribute('aria-label',en?'Open the third-floor map of the Techno Building':'テクノ棟３階の図を開く');document.querySelector('#floor-close').setAttribute('aria-label',en?'Close third-floor map':'３階の図を閉じる');image.alt=en?'Approved third-floor map of the Techno Building. Red Room 2A is reception; toilets and stairs are at the left, with another staircase and connecting corridor at the upper right.':'テクノ棟３階の承認済み案内図。右下の赤い２Ａ教室が受付。左に男女WCと階段、右上に階段と通路。';if(dialog.open){const src='./assets/maps/techno-3f-cream-display.png';if(image.getAttribute('src')!==src)image.src=src;}};
 function open(event){opener=event.currentTarget;dialog.showModal();document.body.classList.add('floor-modal-open');updateFloorLabels();}
 button.addEventListener('click',open);mapHit.addEventListener('click',open);mapHit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open(event);}});
 document.querySelector('#floor-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('floor-modal-open');opener.focus();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 updateFloorLabels();
})();

// One native modal menu: hidden controls are inert, focus is trapped by the browser.
(()=>{
 const menu=document.querySelector('#site-menu'),toggle=document.querySelector('#menu-toggle'),close=document.querySelector('#menu-close');
 let savedY=0,destination=null;
 window.updateMenuLabels=()=>{const en=siteLanguage==='en';toggle.setAttribute('aria-label',en?'Open menu':'メニューを開く');close.setAttribute('aria-label',en?'Close menu':'メニューを閉じる');menu.setAttribute('aria-label',en?'Menu':'メニュー');};
 toggle.addEventListener('click',()=>{if(document.querySelector('#floor-dialog').open)return;savedY=window.scrollY;destination=null;menu.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');});
 close.addEventListener('click',()=>menu.close());
 menu.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=Array.from(menu.querySelectorAll('a[href],button:not([disabled])')),first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');if(destination){destination.setAttribute('tabindex','-1');destination.focus({preventScroll:true});destination=null;}else{window.scrollTo({top:savedY,behavior:'instant'});toggle.focus({preventScroll:true});}});
 menu.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)menu.close();}});
 menu.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{destination=document.querySelector(link.getAttribute('href'));menu.close();}));
 menu.querySelectorAll('[data-lang],#contrast-toggle').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(()=>{if(menu.open)window.scrollTo({top:savedY,behavior:'instant'});})));
 updateMenuLabels();
})();
