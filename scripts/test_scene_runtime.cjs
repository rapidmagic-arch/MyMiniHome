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
 addEventListener(t,f){this.events[t]=f}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}focus(){}contains(n){return this.children.includes(n)}
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
for(const id of ['panel','storyBox','actorReaction','linkForm','linkNotice','toggleLinkForm','speechBubble','meetingBubble','pondRipple','mailboxSignal','noteForm','noteNotice','previewMessage','placementHint','hostPip','hostFullscreen','hostModeStatus','dropOverlay','placementBar','settings'])els[id].hidden=true;
els.scene.textContent=JSON.stringify(scene);els.musicVolume.value='30';
const doc={body:new E('body'),hidden:false,events:{},getElementById:id=>els[id],createElement:t=>new E(t),addEventListener(t,f){this.events[t]=f}};
const win={innerHeight:800,AudioContext:AudioCtx,matchMedia:()=>({matches:false,addEventListener(){}}),events:{},addEventListener(t,f){this.events[t]=f},setTimeout(){}};
let raf,n=0;const intervals=new Map();
// Expose local state only in the test copy. The delivered scene remains uninstrumented.
const instrumented=source.replace('requestAnimationFrame(render);\n})();','window.__qa={scene,characterNodes,track,resolveWalk,positionsOverlap,groundAnchor,get clock(){return clock}};\nrequestAnimationFrame(render);\n})();');
assert.notEqual(instrumented,source,'test instrumentation anchor missing');
const runner=new Function('document','window','Image','ResizeObserver','requestAnimationFrame','fetch','URL','setInterval','clearInterval',instrumented);
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
 // A quick click on a different animal changes the carried character, not the open panel.
 actor.events.click(event(firstX,firstY,1700));
 const rabbit=els.actors.children[1];
 const switchEvent=event(parseFloat(rabbit.style.left),parseFloat(rabbit.style.top),1900);
 switchEvent.target=rabbit;
 els.stage.events.click(switchEvent);
 assert.equal(actor.classList.contains('is-carried'),false);
 assert.equal(rabbit.classList.contains('is-carried'),true);
 assert.equal(els.panel.hidden,true);
 doc.events.keydown({key:'Escape'});
 assert.equal(rabbit.classList.contains('is-carried'),false);
 // Single tap, invalid region, safe drop, patrol continuation.
 actor.events.click(event(firstX,firstY,2300));
 assert.equal(els.panel.hidden,true);
 els.stage.events.click(event(1460,200,2600));assert.equal(actor.classList.contains('is-carried'),true);
 els.stage.events.pointermove(event(400,680,2650));tick(20,22);
 assert.ok(Math.abs(parseFloat(actor.style.left)-400)<1);
 els.stage.events.click(event(400,680,3100));tick(22,23);
 assert.equal(actor.classList.contains('is-carried'),false);
 assert.ok(Math.abs(parseFloat(actor.style.left)-400)<12);
 assert.equal(els.dropOverlay.hidden,true);
 tick(23,42);assert.ok(Math.abs(parseFloat(actor.style.left)-400)>1);
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
 // A deliberately relocated bear may move a short distance of its own accord, then stays put.
 const bear2=els.actors.children[5],walker=els.actors.children[0],qa=win.__qa;
 const bi=qa.characterNodes.get('bear'),wi=qa.characterNodes.get('squirrel');
 bear2.events.click(event(bi.x,bi.y,12000));
 els.stage.events.click(event(520,680,13000));
 assert.equal(bear2.classList.contains('is-carried'),false,'bear placement');
 assert.ok(bi.arrivalPending,'arrival activity pending until landing ends');
 tick(90,95);
 assert.ok(Math.abs(bi.x-520)<.001&&Math.abs(bi.y-680)<.001,'landing remains at clicked ground point');
 tick(95,125);
 assert.ok(!bi.arrivalPending&&!bi.activity,'arrival activity completes');
 assert.ok(Math.abs(bi.x-520)<=26.001&&Math.abs(bi.y-680)<.001,'bear activity bounded');
 const rest={x:bi.x,y:bi.y};
 tick(125,150);
 assert.ok(Math.hypot(bi.x-rest.x,bi.y-rest.y)<.001,'settled bear not displaced');
 // Isolated collision fixture: other actors are removed from the test-only map,
 // the original collision solver and renderer are unchanged.
 for(const key of [...qa.characterNodes.keys()])if(!['bear','squirrel'].includes(key))qa.characterNodes.delete(key);
 qa.scene.movementZones.land=[{x:260,y:600,w:720,h:278}];
 Object.assign(bi,{x:520,y:680,homeX:520,homeY:680,activity:null,arrivalPending:false,landingUntil:0});
 wi.actor.patrol={startX:360,endX:760,y:680,walkMs:6500,pauseMs:200,offsetMs:0};
 Object.assign(wi,{x:360,y:680,homeX:360,homeY:680,moveClock:0,patrolShiftX:0,landingZone:null,avoidance:null,landingUntil:0});
 let overlaps=0,detours=0,greetings=0,furthestX=0;
 for(let i=150;i<340;i++){
  tick(i,i+1);
  if(qa.positionsOverlap(wi,{x:wi.x,y:wi.y},bi,{x:bi.x,y:bi.y}))overlaps++;
  if(Math.abs(wi.y-680)>8)detours++;
  if(!els.meetingBubble.hidden)greetings++;
  furthestX=Math.max(furthestX,wi.x);
  assert.ok(Math.hypot(bi.x-520,bi.y-680)<.001,'idle obstacle stays fixed');
 }
 assert.equal(overlaps,0,'no collision in detour fixture');
 assert.ok(detours>0&&furthestX>620,'walker actually bypasses obstacle');
 assert.ok(greetings>0,'greeting appears');
 console.log('Collision QA:',{overlaps,detours,greetings,furthestX});
 qa.scene.movementZones.land=[{x:260,y:658,w:720,h:44}];
 Object.assign(wi,{x:360,y:680,homeX:360,homeY:680,moveClock:0,patrolShiftX:0,landingZone:null,avoidance:null});
 let maxBlockedX=0,waitFrames=0,previousX=360;
 for(let i=340;i<460;i++){
  tick(i,i+1);
  maxBlockedX=Math.max(maxBlockedX,wi.x);
  if(Math.abs(wi.x-previousX)<.001)waitFrames++;
  previousX=wi.x;
  assert.ok(Math.hypot(bi.x-520,bi.y-680)<.001,'stationary obstacle unchanged');
  assert.ok(!qa.positionsOverlap(wi,{x:wi.x,y:wi.y},bi,{x:bi.x,y:bi.y}),'no collision in narrow lane');
 }
 assert.ok(maxBlockedX<450&&waitFrames>=20,'blocked walker waits');
 console.log('No-detour QA:',{maxBlockedX,waitFrames});
 console.log('PASS MyMiniHome: single/double tap, character switch, invalid/occupied landing, stop/detour/greet/no-detour fallback, stationary idle, story, BGM and responsive');
})().catch(e=>{console.error('FAIL MyMiniHome regression',e);process.exitCode=1});
