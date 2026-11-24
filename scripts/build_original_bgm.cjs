/* Original MyMiniHome compositions. No samples or third-party songs. Node 22. */
const fs=require('node:fs'),path=require('node:path');
const themes=[
 {file:'01_sunlit_grove.wav',title:'숲속 햇살',bpm:94,root:48, chords:[[48,52,55],[53,57,60],[45,48,52],[43,47,50],[48,52,55],[53,57,60],[43,47,50],[48,52,55]], melody:[72,76,79,76,77,81,84,81,76,72,69,72,74,79,83,79,72,76,79,84,81,77,76,74,71,74,79,77,76,74,72,72]},
 {file:'02_warm_cottage.wav',title:'포근한 오두막',bpm:82,root:45,chords:[[45,48,52],[41,45,48],[48,52,55],[43,47,50],[45,48,52],[41,45,48],[43,47,50],[45,48,52]],melody:[69,72,76,72,69,72,77,76,72,76,79,76,71,74,79,74,69,72,76,81,77,76,72,69,71,74,76,74,72,71,69,69]},
 {file:'03_petal_walk.wav',title:'꽃잎 산책',bpm:104,root:48,chords:[[48,52,55],[55,59,62],[57,60,64],[53,57,60],[48,52,55],[55,59,62],[53,57,60],[48,52,55]],melody:[76,79,84,79,74,79,83,79,72,76,81,76,77,81,84,81,76,79,84,88,83,79,77,74,77,81,79,76,74,76,72,72]}
];
const SR=16000, TAU=2*Math.PI;
function wave(theme){
 const beat=60/theme.bpm,N=Math.round(32*beat*SR),v=new Float64Array(N);
 function note(m,start,dur,amp,type){
  const f=440*2**((m-69)/12),at=Math.round(start*SR),len=Math.min(Math.round(dur*SR),N-at);
  for(let i=0;i<len;i++){
   const t=i/SR,phase=TAU*f*t;
   const attack=Math.min(1,t/(type==='pad'?.13:.025)),release=Math.min(1,(dur-t)/(type==='pad'?.32:.12));
   let y;
   if(type==='keys')y=(Math.sin(phase)+.27*Math.sin(2*phase)*Math.exp(-3*t)+.09*Math.sin(3*phase)*Math.exp(-6*t))*Math.exp(-2.1*t);
   else if(type==='bell')y=(Math.sin(phase)+.20*Math.sin(2.01*phase)*Math.exp(-5*t)+.11*Math.sin(3.02*phase)*Math.exp(-8*t))*Math.exp(-4*t);
   else if(type==='pad')y=(Math.sin(phase)+.14*Math.sin(2*phase))*.62;
   else y=(Math.sin(phase)+.16*Math.sin(2*phase))*Math.exp(-1.5*t);
   v[at+i]+=amp*attack*Math.max(0,release)*y;
  }
 }
 for(let bar=0;bar<8;bar++){
  const c=theme.chords[bar],t=bar*4*beat;
  note(c[0]-12,t,beat*1.8,.17,'bass');
  note(c[0]-5,t+2*beat,beat*1.75,.12,'bass');
  c.forEach(m=>note(m,t,beat*3.96,.055,'pad'));
  for(let j=0;j<8;j++)note(c[j%3]+12,t+j*.5*beat,.8*beat,.065,'keys');
  for(let j=0;j<4;j++){
   const m=theme.melody[bar*4+j];
   note(m,t+j*beat,beat*.93,.20,'keys');
   if(j===1||j===3)note(m+12,t+j*beat+.24*beat,beat*.58,.034,'bell');
  }
 }
 // Short boundary fades and measured normalization; the playlist can cycle without clicks.
 let peak=0,sum=0;
 for(let i=0;i<N;i++){v[i]*=Math.min(1,i/(SR*.06),(N-1-i)/(SR*.14));peak=Math.max(peak,Math.abs(v[i]));}
 const gain=.78/Math.max(peak,.001),b=Buffer.alloc(44+N*2);
 b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(N*2,40);
 for(let i=0;i<N;i++){const x=Math.max(-32767,Math.min(32767,Math.round(v[i]*gain*32767)));b.writeInt16LE(x,44+i*2);sum+=(x/32767)**2;}
 return {bytes:b,seconds:N/SR,peak:.78,rms:Math.sqrt(sum/N)};
}
const root=path.resolve(__dirname,'../assets/audio/bgm');
fs.mkdirSync(root,{recursive:true});
const tracks=[];
for(const theme of themes){
 const w=wave(theme);fs.writeFileSync(path.join(root,theme.file),w.bytes);
 tracks.push({title:theme.title,file:theme.file,durationSeconds:Math.round(w.seconds*10)/10,origin:'MyMiniHome original procedural composition'});
 console.log(theme.file,{seconds:w.seconds,bytes:w.bytes.length,peak:w.peak,rms:w.rms});
}
fs.writeFileSync(path.join(root,'playlist.json'),JSON.stringify({version:1,tracks},null,2)+'\n');
