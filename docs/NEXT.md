# MyMiniHome — 최신 상태 / 다음 작업 인계 (2026-11-24)

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
