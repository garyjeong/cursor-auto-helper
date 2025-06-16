# Cursor IDE Agent Resume & Skip 자동화 확장

## ✨ 프로젝트 목적

Cursor IDE(또는 VSCode)에서 AI Agent(에이전트)와의 채팅이 중단되었을 때 나타나는 **"Resume" 버튼**과 **"Skip" 버튼**을 자동으로 감지하고 클릭하여, 사용자의 작업 흐름이 끊기지 않도록 돕는 VSCode 확장 프로그램입니다.

## 🚀 주요 기능

- **Agent 패널 자동 탐색**: IDE 내 모든 Agent/AI 패널(Webview 기반)을 자동으로 탐색하고 감시합니다.
- **"Resume" 버튼 자동 클릭**: "Resume" 버튼이 나타나는 즉시 클릭하여 대화를 재개합니다.
- **"Skip" 버튼 지연 클릭**: "Skip" 버튼은 사용자가 설정한 시간(기본 5초) 후에 클릭하여 불필요한 대기 시간을 줄입니다.
- **지능형 우선순위 제어**: "Resume" 버튼이 나타나면 진행 중이던 "Skip" 클릭 타이머를 즉시 취소하여, 항상 최적의 동작을 보장합니다.
- **다중 패널 및 UI 지원**: 여러 개의 Agent 패널을 동시에 독립적으로 지원하며, 웹뷰 기반 UI와 네이티브 UI를 모두 감지합니다.
- **높은 사용자 정의**: 자동화 기능 ON/OFF, 감지 주기, 버튼 선택자(Selector) 등 대부분의 기능을 사용자가 직접 설정할 수 있습니다.

## 🛠️ 기술 스택

- **언어**: TypeScript
- **플랫폼**: VSCode Extension API
- **주요 기술**:
  - Webview 패널 제어 및 스크립트 주입
  - VSCode 명령(Command) 자동 실행 및 API 활용
  - 확장 설정(Configuration) 시스템
  - 타이머 기반의 비동기 작업 처리

## 📂 프로젝트 구조

```
cursor-auto-resumer/
├── src/                    # 확장 프로그램 핵심 로직
│   ├── extension.ts        # 확장 프로그램 진입점
│   ├── agentWatcher.ts     # Agent 패널 감시 및 자동화 로직
│   ├── webviewScript.ts    # 웹뷰에 주입되는 DOM 조작 스크립트
│   ├── config.ts           # 설정 관리
│   └── types.ts            # 타입 정의
├── package.json            # 확장 정보, 의존성, 명령어 및 설정 정의
├── tsconfig.json           # TypeScript 컴파일 설정
├── webpack.config.js       # Webpack 번들링 설정
├── tests/                  # 테스트 코드
└── .vscode/
    └── launch.json         # 디버깅 설정
```

## ⚙️ 설정 옵션

VSCode 설정(`Ctrl+,`)에서 `cursorAutoResumer`를 검색하여 아래 옵션을 변경할 수 있습니다.

#### Resume 버튼 설정
- `cursorAutoResumer.enabled`: 자동 resume 기능 활성화/비활성화
- `cursorAutoResumer.checkInterval`: 감시 주기 (기본값: 1000ms)
- `cursorAutoResumer.customSelectors`: 사용자 정의 resume 버튼 selector 배열
- `cursorAutoResumer.debugMode`: 디버그 로그 활성화

#### Skip 버튼 설정
- `cursorAutoResumer.skipButtonEnabled`: Skip 버튼 기능 활성화/비활성화 (기본값: true)
- `cursorAutoResumer.skipButtonDelay`: Skip 버튼 클릭 지연 시간 (기본값: 5000ms, 범위: 1-30초)
- `cursorAutoResumer.skipButtonCustomSelectors`: 사용자 정의 skip 버튼 selector 배열

## 💻 사용법 및 명령어

### 사용법
1. VSCode 마켓플레이스에서 확장을 설치합니다.
2. 설치 후 별도의 설정 없이 바로 자동 감지 및 클릭 기능이 활성화됩니다.
3. 필요한 경우, 위 "설정 옵션"을 통해 기능을 제어할 수 있습니다.

### 명령어
명령 팔레트(`Ctrl+Shift+P` 또는 `Cmd+Shift+P`)에서 다음 명령어를 사용할 수 있습니다.

- `Cursor Auto Resumer: Enable`: 확장 기능 전체를 활성화합니다.
- `Cursor Auto Resumer: Disable`: 확장 기능 전체를 비활성화합니다.
- `Cursor Auto Resumer: Enable Skip Button`: Skip 버튼 자동 클릭 기능을 활성화합니다.
- `Cursor Auto Resumer: Disable Skip Button`: Skip 버튼 자동 클릭 기능을 비활성화합니다.
- `Cursor Auto Resumer: Set Skip Button Delay`: Skip 버튼 클릭 지연 시간을 설정합니다.
- `Cursor Auto Resumer: Show Status`: 현재 상태(활성화 여부, 통계 등)를 확인합니다.

## 📜 개발 및 배포 가이드

상세한 개발, 테스트, 빌드, 배포 및 릴리스 가이드는 다음 문서를 참고하세요.

- **[VSCE_GUIDE.md](./VSCE_GUIDE.md)**: VSIX 패키징 및 VS Code Marketplace 배포 가이드
- **[VSCE_CHECKLIST.md](./VSCE_CHECKLIST.md)**: 배포 전 필수 체크리스트

## 📝 라이선스

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다. 