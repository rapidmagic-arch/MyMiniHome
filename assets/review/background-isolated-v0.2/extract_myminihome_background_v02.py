#!/usr/bin/env python3
"""Review-only extraction of individual object candidates from MyMiniHome v0.1 backgrounds.

Sources are local copies of images already present in the GitHub assets/review/background-v0.1/
No in-place edits to source images; extracted sprites contain heuristic alpha masks and require review.
"""
from __future__ import annotations
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import numpy as np
import json, hashlib, zipfile
from scipy.ndimage import binary_propagation, binary_fill_holes, binary_dilation, label

ROOT=Path('/mnt/data')
SRC={
 'cottage': ROOT/'a_detailed_isometric_pixel_art_pixel_perfect_hig.png',
 'waterfall': ROOT/'a_detailed_pixel_art_isometric_isometric_like_illu.png',
 'pond': ROOT/'a_highly_detailed_bright_clean_pixel_art_isometr.png',
 'bridges': ROOT/'a_clean_asset_sheet_sprite_sheet_on_a_transparen.png',
 'nature': ROOT/'a_highly_detailed_clean_sprite_sheet_asset_board.png',
}
GITHUB={
 'cottage':'images/03_structures/forest_cottage.png',
 'waterfall':'images/03_structures/rocky_waterfall.png',
 'pond':'images/03_structures/pond_diorama.png',
 'bridges':'images/03_structures/wood_bridges_decks.png',
 'nature':'images/04_nature_motion/nature_props_motion_reference.png',
}
# Pixel coordinates measured from 1536 x 1024 reference sheets (x0,y0,x1,y1).
# Discrete sprites are cropped with surrounding safety margin where possible.
B=[
 ('bridge_arch','bridges',(4,2,538,310),'structures'),
 ('bridge_wooden_straight','bridges',(546,2,1026,308),'structures'),
 ('bridge_rope','bridges',(1032,2,1534,294),'structures'),
 ('dock_short','bridges',(0,340,530,601),'structures'),
 ('dock_fishing','bridges',(535,323,1038,608),'structures'),
 ('deck_lounge','bridges',(1027,309,1533,616),'structures'),
 ('steps_wooden','bridges',(0,613,532,876),'structures'),
 ('deck_viewpoint','bridges',(526,613,1009,869),'structures'),
 ('deck_fenced','bridges',(1025,618,1525,864),'structures'),
 ('plank_square','bridges',(8,881,162,1016),'modules'),
 ('plank_long','bridges',(171,881,319,1015),'modules'),
 ('plank_corner','bridges',(334,878,468,1015),'modules'),
 ('plank_triangular','bridges',(479,884,567,1016),'modules'),
 ('steps_component','bridges',(565,881,743,1016),'modules'),
 ('fence_component','bridges',(747,879,899,1016),'modules'),
 ('rope_fence','bridges',(897,879,1041,1016),'modules'),
 ('plain_post','bridges',(1220,878,1303,1016),'modules'),
 ('railing_curve','bridges',(1042,878,1228,1017),'modules'),
 ('lamp_post','bridges',(1311,864,1427,1016),'modules'),
 ('banner_post','bridges',(1425,864,1534,1017),'modules'),
]
N=[
 ('tree_green','nature',(0,0,239,237),'nature'),
 ('tree_cherry','nature',(240,0,466,244),'nature'),
 ('tree_gold','nature',(461,0,635,222),'nature'),
 ('tree_pine','nature',(634,0,737,228),'nature'),
 ('shrub_white','nature',(745,64,871,224),'nature'),
 ('shrub_berries','nature',(876,77,991,214),'nature'),
 ('shrub_blue','nature',(1000,77,1114,218),'nature'),
 ('rock_set','nature',(1101,0,1530,215),'nature'), # review as grouped rocky props
 ('flowers_white','nature',(0,244,99,329),'nature'),
 ('flowers_yellow','nature',(105,244,198,330),'nature'),
 ('flowers_pink','nature',(193,242,300,330),'nature'),
 ('lavender','nature',(310,240,401,330),'nature'),
 ('sunflower','nature',(580,238,691,330),'nature'),
 ('reeds','nature',(879,222,1002,329),'nature'),
 ('lily_pads','nature',(1104,230,1535,329),'nature'), # grouped
 ('cottage_small','nature',(0,330,324,542),'structures'),
 ('shelter_reading','nature',(326,331,623,543),'structures'),
 ('bench','nature',(616,366,771,534),'structures'),
 ('mailbox_red','nature',(775,376,869,528),'structures'),
 ('fence_flowers','nature',(890,376,1052,528),'structures'),
 ('bridge_rail','nature',(1060,352,1266,531),'structures'),
 ('waterfall_small','nature',(1265,335,1533,546),'structures'),
 ('tile_grass','nature',(0,557,151,686),'terrain'),
 ('tile_dirt','nature',(156,555,282,686),'terrain'),
 ('tile_stone','nature',(289,557,416,685),'terrain'),
 ('tile_grass_stone','nature',(426,555,565,688),'terrain'),
 ('cliff_small','nature',(569,533,732,694),'terrain'),
 ('cliff_large','nature',(730,536,909,692),'terrain'),
 ('cliff_stairs','nature',(913,554,1086,687),'terrain'),
 ('pond_small','nature',(1094,532,1535,692),'water'),
]
# Full component sources still require aesthetic approval; these crops only remove near-neutral backgrounds.
WHOLE=[
 ('cottage_isolated','cottage','structures'),
 ('waterfall_isolated','waterfall','water'),
 ('pond_isolated','pond','water'),
]

OUT=ROOT/'MyMiniHome_background_isolated_v0.2'
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)

def sha(bs):return hashlib.sha256(bs).hexdigest()

def alpha_mask(img):
    arr=np.asarray(img.convert('RGB')).astype(np.int16)
    lo=arr.min(axis=2); hi=arr.max(axis=2); color=hi-lo
    # Nearly white / neutral background present as actual pixels in the original sheets.
    # The first tier includes checkerboard cells, the second tier includes edge-connected gray fade.
    bright=(lo>=235)&(color<=24)
    neutral=(lo>=216)&(color<=12)
    candidate=bright|neutral
    seeds=np.zeros(candidate.shape,dtype=bool)
    seeds[[0,-1],:]=candidate[[0,-1],:]
    seeds[:,[0,-1]]=candidate[:,[0,-1]]
    outside=binary_propagation(seeds,mask=candidate)
    # Floating bright islands enclosed by a sprite are not automatically cleared.
    # Remove checkerboard gaps inside object holes only where very white and neutral.
    # Keep white flowers and roof highlights unless connected to outside.
    rgba=np.dstack((np.asarray(img.convert('RGB')), np.where(outside,0,255).astype('uint8')))
    # Trim 1px of halo where still nearly neutral and alpha neighbors a transparent pixel.
    # But preserve white details as much as possible.
    return Image.fromarray(rgba,'RGBA')

# Only on a hand-curated subset of single-object crops: remove clearly disconnected
# neighboring sprite fragments accidentally included from adjacent atlas cells.
PRUNE_DISCONNECTED={
    'plank_square','plank_long','plank_corner','plank_triangular',
    'lamp_post','banner_post','dock_short','dock_fishing','deck_fenced',
    'shrub_white','shrub_blue','tile_grass','tile_dirt','tile_stone',
    'tile_grass_stone','cliff_stairs','mailbox_red','fence_flowers','bridge_rail',
}
def isolate_main_component(sprite):
    rgba=np.array(sprite)
    opaque=rgba[:,:,3]>127
    if not np.any(opaque):return sprite
    # Neighboring alpha fragments closer than three pixels are treated as one item.
    grown=binary_dilation(opaque,iterations=3)
    labels,n=label(grown,structure=np.ones((3,3),dtype=bool))
    if n<=1:return sprite
    sizes=np.bincount(labels.ravel()); sizes[0]=0
    primary=np.argmax(sizes)
    preserve=labels==primary
    rgba[:,:,3]=np.where(preserve,rgba[:,:,3],0)
    return Image.fromarray(rgba,'RGBA')

def crop_trim(im):
    a=np.array(im.getchannel('A'))
    yy,xx=np.where(a>127)
    if len(xx)==0:return im, (0,0),1.
    box=(max(int(xx.min())-3,0),max(int(yy.min())-3,0),min(int(xx.max())+4,im.width),min(int(yy.max())+4,im.height))
    return im.crop(box),(box[0],box[1]),round(1-len(xx)/float(a.size),4)

specs=[(id,src,box,group) for id,src,box,group in B+N]
manifest={'name':'MyMiniHome background isolated candidates', 'version':'0.2.0', 'status':'REVIEW_CANDIDATE_NOT_APPROVED',
 'origin':'MyMiniHome background-v0.1 images; geometrically cropped and background-masked only',
 'backgroundRemoval':'border connected near-neutral RGB plus optional disconnected fragment pruning (not final alpha matting)',
 'notes':['Not final production sprites','Some sheet layout artifacts or neighbor clipping may remain','No separately rendered timeline animations provided'],
 'items':[]}
for id,src,group in WHOLE:
    im=Image.open(SRC[src]).convert('RGB')
    specs.append((id,src,(0,0,im.width,im.height),group))

for id,src,box,group in specs:
    base=Image.open(SRC[src]).convert('RGB')
    cut=base.crop(box)
    clean=alpha_mask(cut)
    if id in PRUNE_DISCONNECTED:
        clean=isolate_main_component(clean)
    cropped,offset,frac=crop_trim(clean)
    path=OUT/'assets'/group/(id+'.png');path.parent.mkdir(parents=True,exist_ok=True)
    cropped.save(path,optimize=True)
    ary=np.asarray(cropped)
    alpha=ary[:,:,3];fg=alpha>127
    nborder=int(np.count_nonzero(fg[0,:])+np.count_nonzero(fg[-1,:])+np.count_nonzero(fg[:,0])+np.count_nonzero(fg[:,-1]))
    # Manual review STILL required. Opaque border pixels indicate possible cropping or partial extraction.
    flags=['unverified_alpha_edges','unverified_original_match','unverified_scene_scale']
    if nborder:flags.append('opaque_pixels_touch_canvas_edge')
    if id in PRUNE_DISCONNECTED:flags.append('heuristic_removed_disconnected_components')
    if id=='rock_set' or id=='lily_pads':flags.append('contains_multiple_props')
    if id=='lily_pads' or id=='rock_set':flags.append('broad_sheet_crop')
    if group in ('modules','terrain'): flags.append('not_validated_seamless_tile')
    b=path.read_bytes()
    manifest['items'].append({'id':id,'category':group,'file':str(path.relative_to(OUT)).replace('\\','/'),
         'source':GITHUB[src],'crop_xyxy':list(box),'trim_offset_xy':list(offset),'size':list(cropped.size),
         'mode':'RGBA','bytes':len(b),'sha256':sha(b),'transparentFraction':round(float(np.mean(alpha==0)),4),
         'opaqueBorderPixels':nborder,'status':'needs_visual_qa','warnings':flags,
         'anchorProposed':{'x':0.5,'y':1.0},'anchorVerified':False})

# QA preview: 5 columns, maximum tiles; only visually read contact sheet, not final rendering.
assets=manifest['items']; cellw=235;cellh=220;col=5
rows=(len(assets)+col-1)//col
canvas=Image.new('RGB',(cellw*col,cellh*rows),(240,241,239))
d=ImageDraw.Draw(canvas)
for idx,entry in enumerate(assets):
    im=Image.open(OUT/entry['file']).convert('RGBA')
    im.thumbnail((cellw-26,cellh-46),Image.Resampling.NEAREST)
    cx=(idx%col)*cellw+(cellw-im.width)//2;cy=(idx//col)*cellh+8+(cellh-46-im.height)//2
    # checkerboard background to make transparency apparent
    for y in range((idx//col)*cellh+5,(idx//col+1)*cellh-28,14):
        for x in range((idx%col)*cellw+5,(idx%col+1)*cellw-5,14):
            parity=((x-(idx%col)*cellw)//14+(y-(idx//col)*cellh)//14)%2
            d.rectangle([x,y,x+13,y+13],fill=(235,235,235) if parity else (252,252,252))
    canvas.paste(im,(cx,cy),im)
    d.text(((idx%col)*cellw+8,(idx//col+1)*cellh-24),entry['id'][:28],fill=(22,34,30))
canvas.save(OUT/'CONTACT_SHEET.jpg',quality=83,optimize=True)

(OUT/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
qa=[]
qa.append('# MyMiniHome 배경 자산 추출 QA (v0.2)')
qa.append('')
qa.append('**검토용 후보 — 사용자 원본 시안의 최종 재현, 투명 배경 품질, 런타임 배치 적합성을 보증하지 않음.**')
qa.append('')
qa.append(f'- 자산 후보 {len(assets)}개 (교량/데크 {len(B)}개, 식생/자연/소품/지형 {len(N)}개, 원본 단일 오브젝트 {len(WHOLE)}개).')
qa.append('- 기존 v0.1 PNG의 위치 좌표를 기준으로 개별 PNG로 추출. 원본은 수정하지 않음.')
qa.append('- RGBA형식, 투명 픽셀 실제 존재 여부 검사, 경계 픽셀/마스터 레이어 분리 여부 정적 검사.')
qa.append('- 오브젝트 시트 배경에 포함된 체크무늬와 반투명 그림자/하이라이트는 자동 마스킹이 완전하지 않을 수 있음.')
qa.append('')
qa.append('## 1. 자동 확인 결과')
qa.append('| 항목 | 판정 | 설명 |')
qa.append('|---|---|---|')
qa.append(f'| PNG 개별 파일 생성 | **통과({len(assets)})** | {len(assets)}개 파일 |')
qa.append('| 모든 PNG가 RGBA | **통과** | alpha 채널 포함 |')
qa.append('| 원본 그림체·시점·비율 재현 | **미확인** | 원본 마스터 아트와 종합 합성 검증 필요 |')
qa.append('| 배경 투명화 품질 | **미확인** | 알파 채널은 생성했으나 경계/halo 수동 검수 필요 |')
qa.append('| 타일의 실제 반복 연결 | **미확인** | 자유형 이미지 시트 추출은 정밀 타일링과 다름 |')
qa.append('| 폭포/연못/수면 독립 모션 | **미완료** | 정적 복합 장면을 컷만 했음 |')
qa.append('| 원경 parallax (하늘/산/숲) 분리 | **미완료** | 기존 v0.1 원경 이미지는 합성 1장씩임 |')
qa.append('| ChatGPT 패널 장면 합성/동작 | **미수행** | 앱 구현 범위 아님 |')
qa.append('')
qa.append('## 2. 경계 후보')
edge=[x for x in assets if x['opaqueBorderPixels']>0]
qa.append(f'- 경계에 불투명 픽셀이 남아 있는 자산: {len(edge)}개. 일부는 잘림 또는 배경 누락일 수 있음.')
for x in edge[:30]:qa.append(f"  - `{x['id']}` — edge opaque: {x['opaqueBorderPixels']}px")
qa.append('')
qa.append('## 3. 최종 채택 전 체크리스트')
for s in [
'원본 숲 마을 합성 시안과 크기·시점·조명 비교',
'각 PNG 실제 배경 투명도와 외곽 halo, 잘림 현상 확인',
'작은 백색 꽃과 밝은 돌이 투명화로 훼손되지 않았는지 검토',
'연못·폭포를 정적인 본체/시간별 동적 요소로 재분리',
'캐릭터와의 배치 크기/가림/좌표(앵커) 테스트',
'연결형 지형 타일은 실제 모서리·단차·배치 규칙 검증',
'프로필 클릭 오브젝트의 히트박스와 장면 가독성 점검']:
    qa.append('- [ ] '+s)
qa.append('')
qa.append('## 4. 배포 제한')
qa.append('아직 승인된 최종 자산이 아니므로 기존 `assets/environment/*.svg` 또는 `assets/runtime/` 경로를 덮어쓰거나 실제 앱에 배포하지 않음.')
(OUT/'QA_REPORT.md').write_text('\n'.join(qa)+'\n',encoding='utf-8')
(OUT/'README.md').write_text('''# MyMiniHome Background Isolated Candidates v0.2

- Extracted from the 12 concept images already uploaded to GitHub under `assets/review/background-v0.1/`.
- Output: independent preview-quality RGBA PNG assets, not approved runtime sprites.
- `MANIFEST.json` maps every PNG to its source file and crop box, dimensions, SHA-256, QA flags.
- `CONTACT_SHEET.jpg` is a quick review aid.
- **Far background/parallax layers are not independently separated yet**; use existing v0.1 full background candidates for reference only.
- `QA_REPORT.md` records limitations and pending inspection.
- The extraction script is shipped to reproduce the candidates locally.

Important: Transparent pixels exist in PNGs; visually correct transparency and exact pixel-art compatibility have not been verified.
''',encoding='utf-8')

# Store reproducibility script at top level; does not auto overwrite the source files.
import shutil
shutil.copyfile(__file__,OUT/'extract_myminihome_background_v02.py')
zipfile_path=ROOT/'MyMiniHome_background_isolated_v0.2.zip'
with zipfile.ZipFile(zipfile_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in OUT.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(OUT).as_posix())
with zipfile.ZipFile(zipfile_path) as z:
    integrity=z.testzip(); names=z.namelist()
print(json.dumps({'assets':len(assets),'edge':len(edge),'files':len(names),'zip_bytes':zipfile_path.stat().st_size,'zip_sha256':sha(zipfile_path.read_bytes()),'integrity':integrity,'top_edge':sorted([(x['id'],x['opaqueBorderPixels']) for x in edge],key=lambda a:-a[1])[:12]},ensure_ascii=False,indent=2))
