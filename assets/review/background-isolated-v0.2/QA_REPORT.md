# MyMiniHome 배경 자산 추출 QA (v0.2)

**검토용 후보 — 사용자 원본 시안의 최종 재현, 투명 배경 품질, 런타임 배치 적합성을 보증하지 않음.**

- 자산 후보 53개 (교량/데크 20개, 식생/자연/소품/지형 30개, 원본 단일 오브젝트 3개).
- 기존 v0.1 PNG의 위치 좌표를 기준으로 개별 PNG로 추출. 원본은 수정하지 않음.
- RGBA형식, 투명 픽셀 실제 존재 여부 검사, 경계 픽셀/마스터 레이어 분리 여부 정적 검사.
- 오브젝트 시트 배경에 포함된 체크무늬와 반투명 그림자/하이라이트는 자동 마스킹이 완전하지 않을 수 있음.

## 1. 자동 확인 결과
| 항목 | 판정 | 설명 |
|---|---|---|
| PNG 개별 파일 생성 | **통과(53)** | 53개 파일 |
| 모든 PNG가 RGBA | **통과** | alpha 채널 포함 |
| 원본 그림체·시점·비율 재현 | **미확인** | 원본 마스터 아트와 종합 합성 검증 필요 |
| 배경 투명화 품질 | **미확인** | 알파 채널은 생성했으나 경계/halo 수동 검수 필요 |
| 타일의 실제 반복 연결 | **미확인** | 자유형 이미지 시트 추출은 정밀 타일링과 다름 |
| 폭포/연못/수면 독립 모션 | **미완료** | 정적 복합 장면을 컷만 했음 |
| 원경 parallax (하늘/산/숲) 분리 | **미완료** | 기존 v0.1 원경 이미지는 합성 1장씩임 |
| ChatGPT 패널 장면 합성/동작 | **미수행** | 앱 구현 범위 아님 |

## 2. 경계 후보
- 경계에 불투명 픽셀이 남아 있는 자산: 38개. 일부는 잘림 또는 배경 누락일 수 있음.
  - `bridge_arch` — edge opaque: 192px
  - `bridge_wooden_straight` — edge opaque: 105px
  - `bridge_rope` — edge opaque: 20px
  - `dock_short` — edge opaque: 16px
  - `dock_fishing` — edge opaque: 85px
  - `deck_lounge` — edge opaque: 104px
  - `steps_wooden` — edge opaque: 169px
  - `deck_viewpoint` — edge opaque: 15px
  - `plank_long` — edge opaque: 13px
  - `plank_corner` — edge opaque: 53px
  - `plank_triangular` — edge opaque: 35px
  - `lamp_post` — edge opaque: 16px
  - `banner_post` — edge opaque: 36px
  - `tree_green` — edge opaque: 101px
  - `tree_cherry` — edge opaque: 75px
  - `tree_gold` — edge opaque: 46px
  - `tree_pine` — edge opaque: 51px
  - `shrub_white` — edge opaque: 26px
  - `shrub_berries` — edge opaque: 4px
  - `shrub_blue` — edge opaque: 24px
  - `rock_set` — edge opaque: 3px
  - `flowers_white` — edge opaque: 12px
  - `lavender` — edge opaque: 22px
  - `sunflower` — edge opaque: 34px
  - `reeds` — edge opaque: 15px
  - `cottage_small` — edge opaque: 192px
  - `shelter_reading` — edge opaque: 106px
  - `fence_flowers` — edge opaque: 61px
  - `bridge_rail` — edge opaque: 44px
  - `waterfall_small` — edge opaque: 41px

## 3. 최종 채택 전 체크리스트
- [ ] 원본 숲 마을 합성 시안과 크기·시점·조명 비교
- [ ] 각 PNG 실제 배경 투명도와 외곽 halo, 잘림 현상 확인
- [ ] 작은 백색 꽃과 밝은 돌이 투명화로 훼손되지 않았는지 검토
- [ ] 연못·폭포를 정적인 본체/시간별 동적 요소로 재분리
- [ ] 캐릭터와의 배치 크기/가림/좌표(앵커) 테스트
- [ ] 연결형 지형 타일은 실제 모서리·단차·배치 규칙 검증
- [ ] 프로필 클릭 오브젝트의 히트박스와 장면 가독성 점검

## 4. 배포 제한
아직 승인된 최종 자산이 아니므로 기존 `assets/environment/*.svg` 또는 `assets/runtime/` 경로를 덮어쓰거나 실제 앱에 배포하지 않음.
