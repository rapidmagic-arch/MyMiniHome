# MyMiniHome 음원 폴더

- `bgm/`: 사용 권한이 확인된 MP3·OGG·WAV·M4A 파일을 넣고, 프로젝트 루트에서 `python scripts/build_audio_playlist.py`를 실행하면 `bgm/playlist.json`이 파일명 기준 정렬 순서로 갱신됩니다.
- `sfx/characters/`, `sfx/objects/`: 추후 효과음 파일의 관리 위치입니다. 현재는 브라우저 Web Audio가 만드는 **자체 합성 효과음**을 사용하므로 실제 파일은 필요하지 않습니다.
- BGM 파일이 없는 경우 템플릿은 코드로 합성한 **독자적인 짧은 내장 테마 3종**을 반복 재생합니다. 실제 외부 무료 음원이 내장되어 있다는 뜻은 아닙니다.
- 공개 ChatGPT 앱이나 GitHub Pages에 파일을 올리기 전에 음악의 저작권·재배포 및 공개 스트리밍 권한을 직접 확인하세요.
- 파일 추가 후 `playlist.json`과 음원 모두 Git에 반영해야 사용자 화면에서 재생됩니다. GitHub는 빈 디렉터리를 추적하지 않으므로 `sfx/` 경로는 실제 자산 등록 시 만들 수 있습니다.
- 브라우저·ChatGPT 호스트의 정책에 따라 사용자의 첫 클릭/터치로 재생을 시작해야 합니다.
