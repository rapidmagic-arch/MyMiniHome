# 최신 인계 — Sites 공개 배포 우선 (2026-11-25)

- 현재 원본: `scene-v1-play-and-view-rc1`; `prototype_not_approved`.
- 미션 01~03 신규 코드의 모의 회귀 검사: 합성 음악/파일 플레이리스트 분기 모두 통과. 실제 화면·청음·터치 시험은 미검증.
- 공개 배포 준비: `scripts/build_sites_bundle.cjs` 및 [Sites 실행 인계](sites-deployment.md). 공개 런타임 파일 102개 자산 참조와 루트 HTML의 모의 staging 검증 완료.
- **현재 최우선 미션: 실제 ChatGPT Sites 생성·공개 URL·접속 검증.** 실제 사이트 배포는 아직 수행하지 못함. Sites 생성/공유 권한이 제공되는 Work 실행 환경에서 위 인계를 사용한다.
- 사용자 공개 배포 목적은 확정. 추가 설계 질문은 없음. 실제 호스트 접근·계정 권한이 막히는 단계만 사용자 협의.
- ChatGPT 대화 내 MCP 연결 및 PiP는 공개 사이트와 구분. 최종 아트 승인, 레거시 삭제, v1.0 확정은 이번 범위 제외.

---

# MyMiniHome — 최신 상태 / 다음 작업 인계 (2026-11-25)

## 최신 적용 (2026-11-25 클릭 분리·캐릭터 충돌 방지 — 아래 이력보다 우선)

- **버전:** `scene-v1-encounter-interaction-prototype` (장면 1종; 캐릭터 8종·장소 7곳 보존; 아트 및 ChatGPT 호스트 승인 전).
- **클릭:** 첫 동물 클릭은 데롱데롱 들기만 수행, **같은 캐릭터 빠른 두 번째 클릭/탭** 시 기존 좌측 하단 상세 프로필 표시. 다른 캐릭터를 누르면 들고 있는 대상 교체. 유효하고 비어 있는 지점에만 착지, `Esc` 취소.
- **이동:** 정지한 동물의 좌표 고정(이전 재배치 후 좌우 `drift` 제거). 이동자가 접근하면 정지/가능한 경우 우회/인사. 캐릭터별 보행 시간 정지로 겹침·순간 점프 억제. 발 위치 Y에 따른 앞뒤 레이어.
- **현재 QA:** [클릭·충돌 리뷰 및 모의 시험](click-collision-review-20261125.md). `scripts/test_scene_runtime.cjs`를 새 동작에 맞게 업데이트하여 한/두 번 클릭, 다른 캐릭터 선택, 착지·점유, 정지 동물 밀림 방지, 우회·만남, 음악·스토리, 반응형 시나리오 모의 실행 통과.
- **사용자 포트:** 현재 8766 사용. `git -C "$HOME\MyMiniHome" pull --ff-only origin main` 후 `http://127.0.0.1:8766/scenes/forest-village-v1/index.html?v=encounter-20261125` 접속.
- **검증 경계:** 실제 PC/태블릿 브라우저 렌더링·소리·충돌 자연스러움 및 ChatGPT 위젯 연결은 미검증. 최종 상태 `prototype_not_approved` 유지.

---

## 앞선 상태 (아래는 이력)


## 현재 최우선 기준 (2026-11-25, 아래 이전 이력보다 우선)

- **현재 파일·버전:** `scenes/forest-village-v1/index.html`, `scene-v1-playful-widget-draft`; 단일 마스터 장면 1종과 8종 동물·7개 장소 유지. 확정 Q1~Q6 + [추가 사용자 조건](requirements.md) 반영.
- **구현:** 첫 동물 클릭 → 프로필 A안 좌측 하단 표시 및 데롱데롱 매달림 → 장면 내 유효한 새 위치 클릭 → 착지 후 왕복·제자리 반응 재개. 허용 위치 표시, 무효 위치 거부, Esc 취소. 캐릭터별/장소별 짧은 스토리, 합성 효과음, 자체 오리지널 BGM 3종 루프, 정적 폴더 플레이리스트, 기본 가로세로 전체 맞춤·수동 확대.
- **신규 파일:** `assets/audio/bgm/playlist.json` (현재 비어 있음), `assets/audio/README.md`, `scripts/build_audio_playlist.py`, `scripts/test_scene_runtime.cjs`.
- **검증:** [의견도출·코드 리뷰·변경과 모의 QA](scene-interaction-review-v0.4.md). 실제 GitHub 소스 JS를 가짜 DOM으로 실행한 들기/착지/이동/스토리/BGM 제어/반응형 검사 PASS. 독립 Node 테스트 스크립트가 리포에 있음. 기존 자산 경로 보존.
- **필수 미검증:** 사용자의 Windows 브라우저 실제 재현·청음, 태블릿 터치/가로·세로, 앉는 지점의 아트/물리 자연스러움, 동물 4종 폴백 품질, ChatGPT 앱 설치·PiP/전체화면/오디오 호스트 검증. 로컬 stdio MCP에 모드 메타데이터를 추가했지만 **ChatGPT 사이트에 연결한 것은 아님**.
- **다음 사용:** `git -C "$HOME\MyMiniHome" pull --ff-only origin main` 후 로컬 서버에서 `/scenes/forest-village-v1/index.html?v=playful-20261125` 강력 새로고침. `node scripts/test_scene_runtime.cjs` 모의 회귀 실행. 실제 자산 BGM을 넣었다면 `python scripts/build_audio_playlist.py` 후 manifest와 파일을 모두 Git 반영.
- **승인·범위:** 별도 챗봇 재구현, ChatGPT 계정 설치, 외부 공개 배포, 유료·외부 저작권 음악 다운로드, 레거시 review 이미지 삭제 없음. `prototype_not_approved` 상태 유지.

---

## 이전 2026-11-24 이력 (참고; 위 최신 상태로 읽을 것)

**중요:** 1개 기본 장면 `scenes/forest-village-v1/index.html`만 유지한다. 이전 자료 속 '4종 배치', '보행 이미지 미업로드', '오브젝트 5곳'은 **이전 상태**다. 현재 상태는 아래와 같다.

## 지금 구현된 내용
- 기준 장면: 1774×887, 배경 하나에 오두막·다리·폭포·연못이 함께 그려진 고정 마스터 PNG.
- 동물: 총 **8종**. squirrel/rabbit/fox/wolf = 업로드된 6×2 보행프레임으로 짧은 왕복 순찰; owl/bear/frog/hedgehog = 제자리 제스처, 프레임 선택·중심 보정.
- 클릭: 동물 **8종 프로필**, 장면 **7곳**(오두막·독서 쉼터·우체통·다리·연못·폭포·벚꽃나무). 우체통 입력은 로컬 미리보기로만 표시.
- 환경: 물줄기 2곳·연못 3곳·벚꽃잎 6개 CSS 오버레이 + 우체통 편지반응. 원본 배경 픽셀을 변경하거나 구조물 자체를 변형하지 않음.
- 화면: 1774×887 기준 축소/가로 스크롤/전체보기, 움직임 정지 및 `prefers-reduced-motion` 지원.
- 개인 GPT/프로젝트 링크: 실제 URL은 없음. 사용자 본인이 동물 프로필에 `https://chatgpt.com/...` 주소를 입력하면 해당 화면 메모리에서만 보관하고 링크 클릭으로 열 수 있음. 공개 저장소에 저장하지 않음.

## ChatGPT 플러그인 시제품
- `apps/myminihome/server.mjs` : 로컬 **stdio MCP 서버**, `open_forest_village` 툴 + `ui://myminihome/forest-v1.html` 리소스 + `thread` 진입점.
- `apps/myminihome/plugin.json`, `mcp.json` : 독립 패키징/로컬 연결용.
- Node 22 로컬 MCP 5개 JSON-RPC 요청 스모크 통과. **실제 ChatGPT 웹/앱에 플러그인이 설치·연결되어 보이는 상태는 아님**. 웹 환경은 로컬 stdio 실행을 보장하지 않으므로 호스팅 MCP 또는 지원되는 로컬 런타임이 필요할 수 있음.

## 검증 근거 / 품질
- `docs/scene-integration-status-v1.md`: 소스 기준 모의 DOM/환경 효과/호스트 어댑터 검증 결과와 제한.
- `docs/eight-actor-layout-qa-v1.md`: 기본 배치와 이전 8종 동작 검증.
- 사용된 GitHub 파일: 배경 1 + 제스처 48 + 좌우 보행 48 + 보행 매니페스트 1 = **98개 참조**, 누락 0개(2026-11-24 확인).
- 독립 Chromium 시각 QA 미러에서 420/1024/1440px의 배경·8종 이미지 9/9, 환경 DOM 요소 11개, JS 오류 0. **실제 GitHub HTML 그대로 렌더한 테스트가 아님**.

## 남은 의존 작업 (완료라고 기록하지 말 것)
1. **실제 ChatGPT Conversation Panel**에서 서버/앱을 설치·연결해 보이고, 디스플레이 모드·안전 영역·네이티브 composer·마우스/터치 테스트. 현재 로컬 MCP 스켈레톤은 호스트 검증 이전.
2. **사용자 시각 채택:** 원본 마스터와 8종 배치·보행·동물 비례·이동 동선·잔상 비교. 특히 개구리/고슴도치 기존 프레임 테두리와 고정 배경의 가림 한계.
3. **실제 개인 프로젝트/GPT URL 매핑:** 사용자가 직접 세션 내 설정. 허가된 비공개 저장소/host state 사용 방식은 아직 확정되지 않음.
4. **최종 자산 승격 및 레거시 정리:** 검토 자산을 `runtime_active`로 결정하고 경로 변경 → `python scripts/audit_scene_assets.py` 검사 → 브라우저 회귀 테스트 → 이전 `review/` 및 SVG를 필요한 범위에서 `main` 정리. **지금 삭제하면 현재 HTML이 깨질 수 있어 실행하지 않음.**

## 다음 회차 시작 순서
1. 본 문서와 `docs/scene-integration-status-v1.md`, 단일 scene HTML, `apps/myminihome/README.md`를 먼저 확인.
2. 위 의존 작업 중 현재 요청받은 부분만 수행. 새 템플릿·중복 자산 제작 금지. 
3. 변경 후 해당 사례 테스트, 파일 경로 98건(또는 개편된 참조) 확인 및 문서 갱신.
4. 디자인·호스트 성공과 Git 커밋 성공을 별개로 보고.

## 기존 기준
- Q1~Q6: `docs/requirements.md`
- 작업 흐름 이력: `docs/scene-assembly-workflow.md`
- 원본 자산과 QA: `assets/review/`, `docs/asset-guidelines.md`

## 2026-11-24 실행 피드백 및 최신 동작 수정 (이전 상태보다 우선)
- 사용자 관측: `움직임 반응 없음 / 클릭 시 URL 입력만 표시`.
- [수정 원인·내용·모의 검증 보고서](runtime-interaction-fix-20261124.md) 확인. 템플릿의 프로필 개방 시 전역 정지, OS reduced-motion으로 재생 버튼 비활성화, 링크폼 선노출 문제를 수정. 캐릭터 인사말/말풍선/반응 버튼 추가.
- **다음 재개 1순위:** 사용자의 Windows 브라우저에서 `git pull --ff-only` → `?v=motion-fix-20261124` 재로드 → 화면 상단 모션 상태/프레임 4/4, 동물 반응, 오브젝트 반응 확인. 실제 사용자 브라우저 검증 전에는 제품 동작 완료로 승격하지 않음.
- 기존 자산 삭제, ChatGPT 호스트 설치·연결, 사용자 개인 링크 공용 등록은 수행하지 않음.
