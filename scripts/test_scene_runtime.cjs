/* Dependency-free Node 22 mock regression test for the real inline HTML script. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../scenes/forest-village-v1/index.html'),'utf8');
const source=html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
const scene=JSON.parse(html.match(/<script id="scene" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.ok(source,'script missing');
class E{
 constructor(id){
  this.id=id;this.style={setProperty:(k,v)=>this.style[k]=v};this.attrs={};this.children=[];this.dataset={};this.events={};this.value='';this.hidden=false;this.textContent='';this.clientWidth=420;this.offsetWidth=80;
  this.classes=new Set();this.classList={add:(...a)=>a.forEach(x=>this.classes.add(x)),remove:(...a)=>a.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,y)=>{const v=y===undefined?!this.classes.has(x):y;v?this.classes.add(x):this.classes.delete(x);return v}};
 }
 append(x){this.children.push(x)}replaceChildren(...x){this.children=x;this.textContent=''}
 addEventListener(t,f){this.events[t]=f}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}focus(){}
 getBoundingClientRect(){
  if(this.id==='stage')return{left:10,top:100,width:scene.designSize.width*(Number(this.style.transform?.match(/scale\(([^)]+)\)/)?.[1])||1)};
  return{left:10,top:100,width:this.clientWidth};
 }
}
class Img{set src(v){this.path=v;Promise.resolve().then(()=>this.onload?.())}}
class AudioCtx{constructor(){this.currentTime=0;this.state='running';this.destination={}}resume(){return Promise.resolve()}
 createOscillator(){return{frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}}
const els={};
for(const m of html.matchAll(/\bid="([A-Za-z][\w-]*)"/g))els[m[1]]=new E(m[1]);
for(const id of ['panel','storyBox','actorReaction','linkForm','linkNotice','toggleLinkForm','speechBubble','meetingBubble','pondRipple','mailboxSignal','noteForm','noteNotice','previewMessage','placementHint','hostPip','hostFullscreen','hostModeStatus','dropOverlay'])els[id].hidden=true;
els.scene.textContent=JSON.stringify(scene);els.musicVolume.value='30';
const doc={body:new E('body'),hidden:false,events:{},getElementById:id=>els[id],createElement:t=>new E(t),addEventListener(t,f){this.events[t]=f}};
const win={innerHeight:800,AudioContext:AudioCtx,matchMedia:()=>({matches:false,addEventListener(){}}),events:{},addEventListener(t,f){this.events[t]=f},setTimeout(){}};
let raf,n=0;const intervals=new Map();
const runner=new Function('document','window','Image','ResizeObserver','requestAnimationFrame','fetch','URL','setInterval','clearInterval',source);
runner(doc,win,Img,class{observe(){}},f=>raf=f,async url=>({ok:true,json:async()=>url.includes('playlist.json')?{version:1,tracks:[]}:{status:'REVIEW_CANDIDATE_NOT_APPROVED',count:{totalPngs:48}}}),URL,f=>{intervals.set(++n,f);return n},id=>intervals.delete(id));
(async()=>{
 for(let i=0;i<64;i++)await Promise.resolve();
 const tick=(a,b)=>{for(let i=a;i<b;i++)raf(i*120+1)};
 const event=(x,y,timeStamp=10000)=>{const scale=Number(els.stage.style.transform.match(/scale\(([^)]+)\)/)[1]);return{clientX:10+x*scale,clientY:100+y*scale,timeStamp,stopPropagation(){},preventDefault(){}}};
 assert.equal(els.actors.children.length,8);
 assert.equal(els.hotspots.children.length,7);
 assert.match(els.motionStatus.textContent,/4\/4종/);
 assert.equal(els.viewport.style.overflow,'hidden');
 tick(0,20);
 const actor=els.actors.children[0],firstX=parseFloat(actor.style.left),firstY=parseFloat(actor.style.top);
 const initialTap=event(firstX,firstY,1000);
 actor.events.click(initialTap);
 assert.equal(actor.classList.contains('is-carried'),true);
 assert.equal(els.dropOverlay.hidden,false);
 assert.equal(els.panel.hidden,true,'single tap does not open details');
 // Same character twice within 340 ms -> details; no accidental drop.
 els.stage.events.click(event(firstX,firstY,1200));
 assert.equal(actor.classList.contains('is-carried'),false);
 assert.equal(els.panel.hidden,false,'double tap opens profile');
 assert.equal(els.panelTitle.textContent,'다람쥐');
 assert.equal(els.dropOverlay.hidden,true);
 const story=els.storyText.textContent;els.storyNext.events.click();assert.notEqual(els.storyText.textContent,story);
 els.close.events.click();
 // Single tap, invalid region, safe drop, patrol continuation.
 actor.events.click(event(firstX,firstY,2000));
 assert.equal(els.panel.hidden,true);
 els.stage.events.click(event(1460,200,2600));assert.equal(actor.classList.contains('is-carried'),true);
 els.stage.events.pointermove(event(650,680,2650));tick(20,22);
 assert.ok(Math.abs(parseFloat(actor.style.left)-650)<1);
 els.stage.events.click(event(650,680,3100));tick(22,23);
 assert.equal(actor.classList.contains('is-carried'),false);
 assert.ok(Math.abs(parseFloat(actor.style.left)-650)<12);
 assert.equal(els.dropOverlay.hidden,true);
 tick(23,42);assert.ok(Math.abs(parseFloat(actor.style.left)-650)>1);
 actor.events.click(event(parseFloat(actor.style.left),parseFloat(actor.style.top),5000));
 doc.events.keydown({key:'Escape'});
 assert.equal(actor.classList.contains('is-carried'),false,'Escape cancels carry');
 // Idle character must stay in place regardless of nearby walking sprites.
 const bear=els.actors.children[5],bearX=parseFloat(bear.style.left),bearY=parseFloat(bear.style.top);
 tick(42,90);
 assert.equal(parseFloat(bear.style.left),bearX);
 assert.equal(parseFloat(bear.style.top),bearY);
 // Two-tap landing rejects occupied position, not just scenery restrictions.
 actor.events.click(event(parseFloat(actor.style.left),parseFloat(actor.style.top),6000));
 els.stage.events.click(event(bearX,bearY,6500));
 assert.equal(actor.classList.contains('is-carried'),true,'occupied landing must be rejected');
 doc.events.keydown({key:'Escape'});
 assert.equal(actor.classList.contains('is-carried'),false);
 els.musicToggle.events.click();assert.match(els.audioStatus.textContent,/재생 중/);
 els.musicNext.events.click();els.musicToggle.events.click();assert.match(els.audioStatus.textContent,/대기 중/);
 els.close.events.click();els.hotspots.children.find(x=>x.dataset.label==='연못').events.click();
 assert.equal(els.pondRipple.hidden,false);
 win.innerHeight=350;els.viewport.clientWidth=1100;win.events.resize();
 assert.ok(Number(els.stage.style.transform.match(/scale\(([^)]+)\)/)[1])<.3);
 els.toggleFit.events.click();assert.equal(els.viewport.style.overflow,'auto');
 console.log('PASS MyMiniHome: double-tap profile, single-tap carry, invalid/occupied landing, stationary idle, patrol, story, BGM controls, responsive fit');
})().catch(e=>{console.error('FAIL MyMiniHome regression',e);process.exitCode=1});
