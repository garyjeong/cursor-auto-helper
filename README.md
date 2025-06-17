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

- **언어**: TypeScript 5.8.3
- **패키지 매니저**: pnpm (최신)
- **플랫폼**: VSCode Extension API (1.101.0+)
- **테스트**: Jest 30.0.0
- **린트**: ESLint 8.57.1 + TypeScript ESLint 8.34.1
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
├── pnpm-lock.yaml          # pnpm 의존성 락 파일
├── tsconfig.json           # TypeScript 컴파일 설정
├── webpack.config.js       # Webpack 번들링 설정
├── tests/                  # 테스트 코드
└── .vscode/
    ├── launch.json         # 디버깅 설정
    └── tasks.json          # 빌드 태스크 설정
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

## 🚀 확장 프로그램 배포

VSCode 확장 프로그램을 배포하려면 `vsce`(Visual Studio Code Extensions) 도구를 사용합니다.

### 1. 사전 준비

#### Node.js 및 pnpm 설치 확인
```bash
node --version
pnpm --version
```
설치되어 있지 않다면 [Node.js 공식 웹사이트](https://nodejs.org/)에서 다운로드하여 설치합니다.

#### vsce 도구 설치
```bash
pnpm install -g @vscode/vsce
```

### 2. 배포 단계

#### 프로젝트 디렉토리로 이동
```bash
cd cursor-auto-resumer  # 확장 프로그램 디렉토리
```

#### 확장 프로그램 패키징
```bash
pnpm run package
```
현재 디렉토리에 `.vsix` 파일이 생성됩니다.

#### Visual Studio Marketplace에 게시
```bash
pnpm run release:publish
```

### 3. 추가 설정 (최초 배포 시)

#### Personal Access Token 생성
- [Azure DevOps](https://dev.azure.com/)에서 Personal Access Token을 생성해야 합니다.
- Scopes에서 `Marketplace (manage)` 권한을 선택합니다.

#### 게시자 생성
```bash
pnpx @vscode/vsce create-publisher <publisher-name>
```

#### 로그인
```bash
pnpx @vscode/vsce login <publisher-name>
```

### 4. 로컬 설치 (테스트용)
```bash
code --install-extension cursor-auto-resumer-1.0.0.vsix
```

## 🔧 개발 환경 설정

### 사전 요구사항
- **Node.js**: 18.0.0 이상
- **pnpm**: 최신 버전 (전역 설치 권장)
- **VSCode**: 1.74.0 이상

### 의존성 설치
```bash
# pnpm이 설치되지 않은 경우
npm install -g pnpm

# 프로젝트 의존성 설치
pnpm install
```

### 개발 명령어
```bash
# TypeScript 컴파일
pnpm run compile

# Watch 모드로 컴파일 (개발 시 권장)
pnpm run watch

# 테스트 실행 (컴파일 + 린트 + 테스트)
pnpm run test

# 린트 검사만 실행
pnpm run lint

# VSIX 패키지 생성
pnpm run package

# 버전 업데이트
pnpm run version:patch  # 패치 버전 (1.0.0 → 1.0.1)
pnpm run version:minor  # 마이너 버전 (1.0.0 → 1.1.0)
pnpm run version:major  # 메이저 버전 (1.0.0 → 2.0.0)
```

### 디버깅
1. VSCode에서 `F5` 키를 누르거나 `Run and Debug` 패널에서 "Run Extension"을 선택
2. 새로운 Extension Development Host 창이 열림
3. 브레이크포인트를 설정하여 디버깅 가능

#### 디버깅 환경 구성
- ✅ **소스맵 지원**: TypeScript 디버깅 완전 지원
- ✅ **핫 리로드**: watch 모드로 코드 변경 시 자동 컴파일
- ✅ **스마트 스테핑**: 자동으로 생성된 코드 건너뛰기
- ✅ **환경 변수**: 개발/테스트 환경 구분

### 프로젝트 상태
- ✅ **최신 의존성**: 모든 패키지가 최신 버전으로 업데이트됨
- ✅ **pnpm 마이그레이션**: npm에서 pnpm으로 완전 전환
- ✅ **TypeScript 5.x**: 최신 TypeScript 기능 활용
- ✅ **Jest 30.x**: 최신 테스트 프레임워크 사용
- ✅ **ESLint 8.x**: 안정적인 코드 품질 검사

## 📋 최근 업데이트 (v1.0.0)

### 🔄 패키지 매니저 변경 (npm → pnpm)
- 모든 스크립트를 pnpm으로 전환
- 더 빠른 설치 속도와 효율적인 디스크 사용
- pnpm-lock.yaml로 의존성 관리

### 📦 의존성 업데이트
| 패키지 | 이전 버전 | 현재 버전 |
|--------|-----------|-----------|
| TypeScript | 4.9.4 | 5.8.3 |
| @types/vscode | 1.74.0 | 1.101.0 |
| @types/node | 16.x | 24.0.3 |
| Jest | 29.5.0 | 30.0.0 |
| ESLint | 8.28.0 | 8.57.1 |
| @vscode/vsce | 2.19.0 | 3.5.0 |

### 🛠️ 개발 환경 개선
- **F5 디버깅 최적화**: 소스맵, 스마트 스테핑, 환경 변수 설정
- **빌드 태스크 구성**: pnpm 기반 compile, watch, test, lint 태스크
- **ESLint 설정 안정화**: TypeScript 규칙 최적화
- **Jest 설정 수정**: moduleNameMapper 오타 수정

## 📝 라이선스

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다. 