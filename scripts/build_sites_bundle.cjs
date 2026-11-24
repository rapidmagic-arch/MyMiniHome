/* Stage only the public runtime files for ChatGPT Sites. Node.js 22+. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const dest=path.resolve(process.argv[2]||path.join(root,'dist','myminihome-site'));
const html=fs.readFileSync(path.join(root,'scenes','forest-village-v1','index.html'),'utf8');
const scene=JSON.parse(html.match(/<script id="scene" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const audio=JSON.parse(fs.readFileSync(path.join(root,'assets/audio/bgm/playlist.json'),'utf8'));
const assetPath=p=>{
 if(typeof p!=='string'||!p.startsWith('../../assets/')||p.slice(6).split('/').includes('..'))throw new Error('Unexpected asset path: '+p);
 return p.slice(6);
};
const assets=new Set([assetPath(scene.background),assetPath(scene.audio.playlist),'assets/review/walk-v0.1/MANIFEST.json']);
for(const actor of scene.characters){
 if(!/^[a-z-]+$/.test(actor.id)||actor.link!==null)throw new Error('Unexpected actor ID or embedded private link');
 for(let i=1;i<=6;i++){
  const n=String(i).padStart(2,'0');
  assets.add('assets/review/v0.2/frames/'+actor.id+'/'+actor.id+'_'+n+'.png');
  if(actor.patrol)for(const d of ['left','right'])assets.add('assets/review/walk-v0.1/frames/'+actor.id+'/'+actor.id+'_walk_'+d+'_'+n+'.png');
 }
}
for(const track of audio.tracks){
 if(typeof track.file!=='string'||/[\\/#?]/.test(track.file)||track.file.includes('..')||!/\.(wav|mp3|ogg|m4a)$/i.test(track.file))throw new Error('Invalid audio file: '+track.file);
 assets.add('assets/audio/bgm/'+track.file);
}
const paths=[...assets].sort();
for(const p of paths){
 const st=fs.lstatSync(path.join(root,p));
 if(!st.isFile()||st.isSymbolicLink()||!st.size)throw new Error('Missing or unsafe asset: '+p);
}
if(fs.existsSync(dest))throw new Error('Choose a new output directory; existing files are never removed: '+dest);
const entry=html.replaceAll('../../assets/','./assets/');
if(entry.includes('../../assets/'))throw new Error('Unresolved relative paths');
fs.mkdirSync(dest,{recursive:true});
for(const p of paths){
 const out=path.join(dest,p);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.copyFileSync(path.join(root,p),out);
}
fs.writeFileSync(path.join(dest,'index.html'),entry,'utf8');
console.log('Staged '+paths.length+' public assets and index.html in '+dest);
console.log('Import this directory into a ChatGPT Site; this script does not create or publish a Site.');
