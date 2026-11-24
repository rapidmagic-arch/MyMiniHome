# MyMiniHome — ChatGPT Sites 공개 실행 인계

기준일: 2026-11-25 (Asia/Seoul)
목표: 기존 MyMiniHome 단일 숲 마을을 ChatGPT Sites에서 공개 URL로 열고 실제 접속과 동작을 검증한다.

## 현재 상태

- 장면 버전: `scene-v1-play-and-view-rc1`, 최종 상태는 `prototype_not_approved` 유지.
- 기존 단일 장면, 동물 8종, 장소 7곳, 프로필 위치, 클릭/더블탭/착지, 충돌 회피, 음악과 이야기, 접이식 설정 유지.
- `scripts/test_scene_runtime.cjs`: 합성 오디오 폴백 및 실제 저장소 WAV 매니페스트를 사용한 모의 파일 오디오 분기 모두 통과. 이동 동작과 정지 캐릭터의 고정 상태를 구분하고, 우회 가능/불가 조건을 독립 테스트했다.
- `scripts/build_sites_bundle.cjs`: 기존 HTML과 필요한 공개 런타임 자산만 모아 루트 `index.html` 및 상대 경로 `./assets/` 구조로 생성한다. GitHub 트리와 파일 목록을 모의 파일시스템으로 비교한 결과 102개 자산 참조 확인. 로컬 실제 파일 복사나 Sites 런타임 배포가 성공했다는 뜻은 아니다.
- **실제 Sites 생성·배포·공개 링크 및 실제 브라우저/태블릿 동작은 미검증.** 현재 채팅에 Sites 배포 도구가 제공되지 않았고 Work 전환이 선택되지 않았다.

## 1. 공개 런타임 준비

Node.js 22 이상에서 저장소 최신 main을 가져온 뒤:

```powershell
$r = Join-Path $HOME "MyMiniHome"
git -C $r pull --ff-only origin main
Set-Location $r
node scripts/test_scene_runtime.cjs
node scripts/test_scene_runtime.cjs --files
node scripts/build_sites_bundle.cjs
```

결과 경로는 `dist/myminihome-site/`. 스크립트는 이미 존재하는 출력 폴더를 삭제하거나 덮어쓰지 않는다. 새 위치를 쓰려면 출력 디렉터리를 인자로 지정한다. 원본 저장소 파일을 복제한 배포용 산출물일 뿐 별도의 템플릿 원본은 아니다.

## 2. Sites에서 실제 배포

공식 가이드: https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites

ChatGPT 웹에서 Work를 선택하고 @Sites를 사용해 현재 공개 GitHub 저장소 rapidmagic-arch/MyMiniHome의 최신 main을 읽어, 위 스크립트가 만드는 런타임 디렉터리의 index.html과 assets를 기준으로 웹사이트를 구성한다. 이미 생성한 사이트가 있으면 해당 사이트를 사용하고 임의의 중복 사이트를 만들지 않는다.

사이트를 새로 디자인하지 않는다. DB, 사용자 로그인, 외부 API 키, 유료 호스팅은 추가하지 않는다. Sites에서 지원하는 파일 제공 및 MIME 설정을 적용하되, 기존 장면의 동작을 유지한다.

미리보기에서 사이트 내용을 확인한 뒤 배포한다. 공개 권한이 제공되는 경우 Share에서 Anyone on the internet을 선택하고 저장한다. 사이트 소유자는 공개 범위와 실제 URL을 확인한다. 공개 URL이 생성되기 전에는 임의 주소를 만들거나 배포 성공이라고 보고하지 않는다.

## 3. 수용 검증

- 공개 링크로 접속: 로그인하지 않은 별도 브라우저 세션에서 실제 접근 확인.
- PC 및 태블릿 크기의 브라우저에서 배경·8종 캐릭터·7곳 오브젝트 로딩, JS/네트워크 오류, 확대/축소, 클릭/더블탭/취소 및 충돌 회피 확인.
- 사용자 조작 후 WAV 재생, 3곡 순환, 음량·정지 및 효과음 확인.
- 이야기와 기존 프로필, 선택적 GPT 링크의 동작 유지.
- 개인정보: 저장소의 scene 캐릭터 링크는 null이어야 하며 공개 번들에 개인 계정 주소, 자격 증명 또는 비밀 설정을 추가하지 않는다. 메모와 수동 링크는 화면 세션에만 유지한다. Sites 자체 운영 로그의 존재 여부는 별도 호스트 정책에 따른다.
- 실제 태블릿 기기 및 음악 청음이 불가능하면 해당 검증은 미수행으로 구분.

## 4. 범위 경계

이번 목표는 Sites 공개 URL의 실제 실행·검증이다. ChatGPT 대화 내 MCP/PiP 연결은 별도 기능이며, Sites 공개 성공만으로 완료라고 판단하지 않는다. 최종 아트 승인 및 레거시 자산 삭제, v1.0 승격은 제외한다.
