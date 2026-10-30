(()=>{
const board=document.querySelector('#game-board'),result=document.querySelector('#game-result'),status=document.querySelector('#game-status'),loadPanel=document.querySelector('#game-loading'),loadButton=document.querySelector('#game-load'),loadStatus=document.querySelector('#game-load-status');
const targetCard=document.querySelector('.target-card');
const cache=new Map();let target=null,lastStatus='start',phase='idle',loaded=0;
function showWrong(button){lastStatus='wrong';button.dataset.wrong='true';button.disabled=true;button.classList.add('wrong');const mark=document.createElement('span');mark.className='wrong-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');button.append(mark);updateGameLabels();}
let layoutWidth=0;
function layoutBoard(force=false){
 if(board.hidden)return;
 const people=Array.from(board.querySelectorAll('button'));if(!people.length)return;
 const width=Math.floor(board.clientWidth||900);if(!force&&width===layoutWidth)return;layoutWidth=width;
 const counts=width>1000?[8,7,9,8,8]:width>600?[6,7,5,6,5,6,5]:width>420?[5,4,5,4,5,4,5,4,4]:width>290?[4,3,4,3,4,3,4,3,4,3,3,2]:[3,3,3,3,3,3,3,3,3,3,3,3,2,2];
 const pad=width<600?8:14,space=width-pad*2;let index=0,y=12;
 counts.forEach((count,row)=>{
  const weights=Array.from({length:count},(_,j)=>[1.05,.90,1.12,.94,1.02][(j*2+row)%5]),sum=weights.reduce((a,b)=>a+b,0),widths=weights.map(w=>space*w/sum);
  const rowHeight=Math.max(100,Math.max(...widths)*1.28+18);let x=pad;
  widths.forEach(cellWidth=>{const b=people[index],top=[0,10,3,16,6,2,13][index%7],bottom=[2,7,0,10,4,1][index%6],height=rowHeight-top-bottom;
   b.style.left=(x+1)+'px';b.style.top=(y+top)+'px';b.style.width=(cellWidth-2)+'px';b.style.height=height+'px';
   b.style.setProperty('--slot-height',height+'px');b.style.setProperty('--figure-size',[92,88,96,90,94][index%5]+'%');b.style.setProperty('--turn',[0,0,-1.8,0,0,0,1.6,0][index%8]+'deg');b.style.setProperty('--paper-turn',[-4,3,2,-2][index%4]+'deg');b.dataset.row=String(row);
   x+=cellWidth;index++;
  });y+=rowHeight;
 });board.style.height=(y+12)+'px';board.dataset.rows=counts.join(',');
}
if('ResizeObserver' in window)new ResizeObserver(()=>layoutBoard()).observe(board);
function loadingLabels(){loadButton.textContent=gameMessage(phase==='error'?'reload':'load');loadStatus.hidden=phase==='idle';loadStatus.textContent=phase==='idle'?'':gameMessage(phase,loaded);loadButton.disabled=phase==='loading';}
window.updateGameLabels=()=>{
 if(phase!=='ready'){loadingLabels();return;}
 board.querySelectorAll('button').forEach(b=>{const person=characterVariants.find(p=>p.id===b.dataset.person);b.setAttribute('aria-label',describePerson(person)+(b.dataset.wrong?' — '+translate('wrongSelected'):''));b.querySelector('span.color-label').textContent=personColor(person);});
 status.hidden=lastStatus==='found';status.textContent=lastStatus==='found'?'':translate(lastStatus);
 document.querySelector('.game-instruction').textContent=describePerson(target);
 document.querySelector('#target-portrait').setAttribute('aria-label',(siteLanguage==='en'?'Example: ':'見本：')+describePerson(target));
};
function start(focus=false){
 const displayed=characterVariants.map(p=>({...p}));
 for(let i=displayed.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[displayed[i],displayed[j]]=[displayed[j],displayed[i]];}
 const eligible=displayed.filter(p=>p.id!==target?.id);target=eligible[Math.floor(Math.random()*eligible.length)];
 targetCard.hidden=false;board.dataset.round=target.id;document.querySelector('#target-portrait').replaceChildren(createCharacterFigure(target));
 board.replaceChildren();board.hidden=false;board.inert=false;result.hidden=true;status.hidden=false;lastStatus='start';
 displayed.forEach((p,i)=>{
  const b=document.createElement('button');b.type='button';b.className='person-button';b.style.setProperty('--lift',String([0,6,2,8,3,1,7][i%7])+'px');b.style.setProperty('--figure-size',String([96,88,100,92,98][i%5])+'%');b.append(createCharacterFigure(p,cache.get(p.src)));b.dataset.person=p.id;b.dataset.correct=String(p.id===target.id);const label=document.createElement('span');label.className='color-label';label.textContent=personColor(p);b.append(label);
  b.addEventListener('click',()=>{
   if(board.inert||b.disabled)return;
   if(p.id===target.id){result.hidden=false;targetCard.hidden=true;board.inert=true;board.hidden=true;lastStatus='found';status.textContent='';status.hidden=true;result.scrollIntoView({block:'center',behavior:'instant'});result.querySelector('button').focus({preventScroll:true});}
   else showWrong(b);
  });board.append(b);
 });layoutBoard(true);updateGameLabels();if(focus)board.querySelector('button').focus();
}
function imageReady(src){
 if(cache.has(src))return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const image=new Image();let settled=false;
  const timer=setTimeout(()=>finish(false),20000);
  function finish(ok){if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;if(ok){cache.set(src,image);resolve();}else reject(new Error('Image unavailable'));}
  image.onload=()=>{if(image.decode)image.decode().then(()=>finish(true),()=>finish(false));else finish(true);};
  image.onerror=()=>finish(false);image.src=src;
 });
}
async function load(){
 if(phase==='loading')return;
 const loadingStarted=Date.now();targetCard.hidden=true;phase='loading';loaded=cache.size;loadPanel.hidden=false;board.hidden=true;status.hidden=true;board.inert=true;loadingLabels();
 const queue=characterVariants.filter(p=>!cache.has(p.src));let cursor=0;const failures=[];
 async function worker(){while(cursor<queue.length){const p=queue[cursor++];try{await imageReady(p.src);}catch{failures.push(p.id);}loaded=cache.size;loadingLabels();}}
 await Promise.all(Array.from({length:Math.min(4,queue.length)},worker));
 if(failures.length){phase='error';loadPanel.dataset.failed=String(failures.length);loadingLabels();return;}
 phase='ready';board.dataset.loadMs=String(Date.now()-loadingStarted);loadPanel.hidden=true;delete loadPanel.dataset.failed;start(true);
}
loadButton.addEventListener('click',load);
document.querySelector('#retry').addEventListener('click',()=>{if(phase==='ready')start(true)});
targetCard.hidden=true;board.hidden=true;status.hidden=true;loadingLabels();
})();
