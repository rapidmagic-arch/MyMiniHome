import { createInterface } from 'node:readline';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RESOURCE = 'ui://myminihome/forest-v1.html';
const REMOTE = 'https://raw.githubusercontent.com/rapidmagic-arch/MyMiniHome/main/assets/';
const resourceCsp = {
  connectDomains: ['https://raw.githubusercontent.com'],
  resourceDomains: ['https://raw.githubusercontent.com'],
};
const toolMeta = {
  ui: { resourceUri: RESOURCE },
  'openai/ui': { entrypoints: [{ type: 'thread' }] },
};

async function sceneHtml() {
  const source = process.env.MYMINIHOME_SCENE_HTML_PATH || resolve(ROOT, '../../scenes/forest-village-v1/index.html');
  let html;
  try { html = await readFile(source, 'utf8'); }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const remote = 'https://raw.githubusercontent.com/rapidmagic-arch/MyMiniHome/main/scenes/forest-village-v1/index.html';
    const res = await fetch(remote, {signal: AbortSignal.timeout(12000)});
    if (!res.ok) throw new Error('Public scene unavailable: HTTP ' + res.status);
    html = await res.text();
  }
  if (!html.includes('id="scene"') || !html.includes('id="actors"')) {
    throw new Error('MyMiniHome scene HTML is missing required elements');
  }
  // The single scene in Git remains the source of truth. Personal URLs are not committed.
  return html.replaceAll('../../assets/', REMOTE);
}
function response(id, result) {
  process.stdout.write(JSON.stringify({jsonrpc:'2.0', id, result})+'\n');
}
function failure(id, code, message) {
  process.stdout.write(JSON.stringify({jsonrpc:'2.0', id, error:{code,message}})+'\n');
}
async function handle(msg) {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return;
  if (msg.id === undefined) return;
  switch (msg.method) {
    case 'initialize':
      return response(msg.id,{
        protocolVersion:msg.params?.protocolVersion || '2025-06-18',
        capabilities:{tools:{listChanged:false},resources:{listChanged:false}},
        serverInfo:{name:'myminihome',version:'0.1.0'},
      });
    case 'ping': return response(msg.id,{});
    case 'tools/list': return response(msg.id,{tools:[{
      name:'open_forest_village',
      title:'MyMiniHome 숲 마을 열기',
      description:'대화 옆의 숲 마을 패널을 엽니다. 프로젝트 및 GPT 링크는 사용자가 패널 안에서 직접 입력합니다.',
      inputSchema:{type:'object',properties:{},additionalProperties:false},
      annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
      _meta:toolMeta,
    }]});
    case 'tools/call':
      if (msg.params?.name !== 'open_forest_village') return failure(msg.id,-32602,'Unknown tool');
      return response(msg.id,{content:[{type:'text',text:'MyMiniHome 숲 마을 패널을 엽니다.'}],isError:false,
        _meta:{ui:{resourceUri:RESOURCE}}});
    case 'resources/list': return response(msg.id,{resources:[{
      uri:RESOURCE,name:'MyMiniHome Forest Village',mimeType:'text/html;profile=mcp-app',description:'8종 동물과 숲 마을 대화 패널',
    }]});
    case 'resources/read':
      if (msg.params?.uri !== RESOURCE) return failure(msg.id,-32602,'Unknown resource');
      try{
        const html = await sceneHtml();
        return response(msg.id,{contents:[{
          uri:RESOURCE,mimeType:'text/html;profile=mcp-app',text:html,
          _meta:{ui:{prefersBorder:false,csp:resourceCsp},
            'openai/ui':{availableDisplayModes:['inline','pip','fullscreen']},
            'openai/widgetCSP':{resource_domains:['https://raw.githubusercontent.com'],connect_domains:['https://raw.githubusercontent.com'],redirect_domains:['https://chatgpt.com']},
            'openai/widgetDescription':'동물 캐릭터를 들어 올려 옮기고, 음악과 짧은 이야기를 즐길 수 있는 MyMiniHome 숲 마을입니다.'},
        }]});
      }catch(e){return failure(msg.id,-32000,'Scene cannot be loaded: '+e.message)}
    case 'resources/templates/list': return response(msg.id,{resourceTemplates:[]});
    default: return failure(msg.id,-32601,'Method not found');
  }
}
const lines=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of lines){
  if (!line.trim())continue;
  let msg;try{msg=JSON.parse(line)}catch{continue}
  try{await handle(msg)}catch(e){if(msg.id!==undefined)failure(msg.id,-32603,'Internal error: '+e.message)}
}
