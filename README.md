# Cursor IDE Agent Resume 자동화 확장

## 목적

Cursor IDE(또는 VSCode)에서 모든 Agent(에이전트) 채팅 창의 "Resume" 버튼을 자동으로 감지/클릭하여, 채팅이 자동으로 재개(resume)되도록 지원합니다.

## 주요 기능

- **Agent 패널 자동 탐색**: IDE 내 모든 Agent/AI 패널(Webview 기반) 자동 탐색 및 감시
- **Resume 버튼 자동 감지**: Resume 버튼 자동 감지 및 클릭
- **다중 패널 지원**: 여러 패널 동시 지원
- **유연한 UI 지원**: Webview/네이티브 UI 모두 지원
- **커스터마이즈**: 자동화 on/off 및 selector 커스터마이즈 옵션 제공

## 기술 스택

- **개발 언어**: TypeScript
- **플랫폼**: VSCode Extension API
- **주요 기술**: 
  - Webview 패널 제어 및 스크립트 주입
  - VSCode 명령(Command) 자동 실행
  - 확장 설정(Configuration) 제공

## 프로젝트 구조

```
cursor-auto-resumer/
├── src/
│   ├── extension.ts           # 확장 진입점, Agent 패널 탐색 및 제어
│   ├── agentWatcher.ts        # Agent 패널/웹뷰 감시 및 resume 자동화 로직
│   ├── webviewScript.ts       # Webview에 주입되는 DOM 감시/자동 클릭 스크립트
│   ├── config.ts              # 확장 설정 관리
│   └── types.ts               # TypeScript 타입 정의
├── package.json               # 확장 메타데이터, 명령, 설정 정의
├── tsconfig.json              # TypeScript 컴파일 설정
├── webpack.config.js          # 번들링 설정
├── .vscode/
│   └── launch.json            # 디버깅 설정
├── tests/                     # 테스트 코드
│   ├── extension.test.ts
│   └── agentWatcher.test.ts
└── README.md                  # 이 파일
```

## 동작 방식

### 1. Agent 패널 자동 탐색
- VSCode API로 열려 있는 모든 Webview 패널을 주기적으로 탐색
- 각 패널에 TypeScript로 작성된 JavaScript 주입 시도

### 2. Resume 버튼 감지 및 자동 클릭
- 주입된 스크립트는 1초마다 DOM을 감시하여 resume 버튼 탐색
- 지원하는 selector 패턴:
  - `button[data-testid="resume"]`
  - `button:contains("Resume")`
  - `button:contains("재개")`
  - 사용자 정의 selector
- 버튼이 감지되면 자동 클릭, 이미 resume된 상태면 추가 동작 없음

### 3. 여러 패널 동시 지원
- 각 Webview별로 독립적으로 감시/자동화 수행
- 패널별 상태 관리로 중복 클릭 방지

### 4. 네이티브 UI 지원
- Webview가 아닌 경우, resume 관련 커맨드 자동 실행
- 지원 커맨드: `workbench.action.chat.resume` 등

### 5. 설정 옵션
- `cursorAutoResumer.enabled`: 자동 resume 기능 활성화/비활성화
- `cursorAutoResumer.checkInterval`: 감시 주기 (기본값: 1000ms)
- `cursorAutoResumer.customSelectors`: 사용자 정의 resume 버튼 selector 배열
- `cursorAutoResumer.debugMode`: 디버그 로그 활성화

## 설치 및 사용법

### 개발 환경 설정

1. **의존성 설치**
```bash
npm install
```

2. **개발 모드 실행**
```bash
npm run watch
```

3. **확장 테스트**
- F5를 눌러 새로운 VSCode 창에서 확장 테스트

### 사용법

1. 확장 설치 후, 기본적으로 자동 resume 기능이 활성화됩니다.
2. 설정에서 자동화 on/off, resume 버튼 selector를 변경할 수 있습니다:
   - `Ctrl+,` → "Cursor Auto Resumer" 검색
3. 명령 팔레트(`Ctrl+Shift+P`)에서 다음 명령 사용 가능:
   - `Cursor Auto Resumer: Enable`
   - `Cursor Auto Resumer: Disable`
   - `Cursor Auto Resumer: Check Now`

## 보안 및 주의사항

- **CSP 정책**: Webview의 Content Security Policy에 따라 일부 패널에서는 자동화가 제한될 수 있습니다.
- **DOM 구조 변경**: resume 버튼의 DOM 구조가 변경될 경우, 설정에서 selector를 수정해 주세요.
- **성능**: 주기적 감시로 인한 성능 영향을 최소화하기 위해 효율적인 DOM 쿼리를 사용합니다.

## 개발 가이드

### TypeScript 설정
- 엄격한 타입 체크 활성화
- ESLint + Prettier 코드 스타일 적용
- Jest를 이용한 단위 테스트

### 빌드 및 배포
```bash
# 빌드
npm run compile

# 패키징
npm run package

# 테스트
npm test
```

## VSCode 확장 배포 가이드

### 1. VS Code Marketplace 배포

#### 사전 준비
1. **Microsoft 계정 생성**: [Azure DevOps](https://dev.azure.com/)에서 계정 생성
2. **Personal Access Token (PAT) 생성**:
   - Azure DevOps → User Settings → Personal Access Tokens
   - Scopes: `Marketplace (manage)` 선택
   - 생성된 토큰을 안전하게 보관

#### VSCE 도구 설치 및 설정
```bash
# VSCE (Visual Studio Code Extension) 도구 설치
npm install -g @vscode/vsce

# 퍼블리셔 등록 (최초 1회만)
vsce create-publisher <publisher-name>

# PAT 토큰으로 로그인
vsce login <publisher-name>
```

#### 배포 과정
```bash
# 1. 프로젝트 빌드 및 테스트
npm run compile
npm test
npm run lint

# 2. 버전 업데이트 (선택사항)
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 3. VSIX 패키지 생성
vsce package

# 4. Marketplace에 배포
vsce publish

# 또는 특정 버전으로 배포
vsce publish 1.0.1

# 또는 패키지와 배포를 한 번에
vsce publish patch  # 패치 버전 업 + 배포
vsce publish minor  # 마이너 버전 업 + 배포
vsce publish major  # 메이저 버전 업 + 배포
```

### 2. GitHub Releases를 통한 자동 배포

#### GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:
   - `VSCE_PAT`: VS Code Marketplace Personal Access Token

#### 자동 릴리스 프로세스
```bash
# 1. 릴리스 스크립트 실행 (대화형)
npm run release

# 2. 또는 수동으로 태그 생성 및 푸시
git tag v1.0.1
git push origin v1.0.1
```

위 과정을 통해 GitHub Actions가 자동으로:
- 코드 빌드 및 테스트
- VSIX 패키지 생성
- GitHub Release 생성
- VS Code Marketplace 배포
- 체크섬 파일 생성

### 3. 수동 배포 (VSIX 파일)

#### VSIX 파일 생성
```bash
# VSIX 파일 생성
vsce package

# 특정 버전으로 패키징
vsce package --out cursor-auto-resumer-1.0.0.vsix
```

#### 수동 설치 방법
1. **VSCode에서 직접 설치**:
   - `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
   - 생성된 `.vsix` 파일 선택

2. **명령줄에서 설치**:
   ```bash
   code --install-extension cursor-auto-resumer-1.0.0.vsix
   ```

### 4. 배포 전 체크리스트

#### 필수 확인 사항
- [ ] `package.json`의 메타데이터 완성 (name, displayName, description, version, publisher)
- [ ] `README.md` 작성 완료
- [ ] `CHANGELOG.md` 업데이트
- [ ] 라이선스 파일 포함
- [ ] 아이콘 파일 추가 (128x128 PNG 권장)
- [ ] 모든 테스트 통과
- [ ] ESLint 오류 없음

#### package.json 필수 필드 예시
```json
{
  "name": "cursor-auto-resumer",
  "displayName": "Cursor Auto Resumer",
  "description": "Automatically detect and click resume buttons in Cursor IDE agent chat panels",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/cursor-auto-resumer.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/cursor-auto-resumer/issues"
  },
  "homepage": "https://github.com/your-username/cursor-auto-resumer#readme",
  "icon": "icon.png",
  "categories": ["Other"],
  "keywords": ["cursor", "ide", "automation", "resume", "agent", "chat"]
}
```

### 5. 배포 후 관리

#### 업데이트 배포
```bash
# 버그 수정 (패치 버전)
npm run release  # 대화형 선택
# 또는
vsce publish patch

# 새 기능 (마이너 버전)
vsce publish minor

# 호환성 변경 (메이저 버전)
vsce publish major
```

#### 확장 제거
```bash
# Marketplace에서 확장 제거 (되돌릴 수 없음)
vsce unpublish <extension-id>
```

### 6. 모니터링 및 피드백

- **VS Code Marketplace**: 다운로드 수, 평점, 리뷰 확인
- **GitHub Issues**: 사용자 피드백 및 버그 리포트 관리
- **GitHub Actions**: 자동 배포 상태 모니터링
- **Analytics**: 확장 사용 통계 분석

### 7. 배포 문제 해결

#### 자주 발생하는 문제
1. **PAT 토큰 만료**: 새 토큰 생성 후 `vsce login` 재실행
2. **퍼블리셔 이름 충돌**: 고유한 퍼블리셔 이름 사용
3. **패키지 크기 초과**: `.vscodeignore`로 불필요한 파일 제외
4. **메타데이터 누락**: `package.json` 필수 필드 확인

#### 디버깅 명령
```bash
# 패키지 내용 확인
vsce ls

# 상세 로그와 함께 배포
vsce publish --verbose

# 패키지 검증
vsce package --verify
```

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 문제 해결

### 자주 묻는 질문

**Q: Resume 버튼이 감지되지 않아요.**
A: 설정에서 `cursorAutoResumer.customSelectors`에 해당 버튼의 CSS selector를 추가해 보세요.

**Q: 자동화가 작동하지 않아요.**
A: `cursorAutoResumer.debugMode`를 활성화하여 개발자 콘솔에서 로그를 확인해 보세요.

**Q: 성능에 영향을 주나요?**
A: 최적화된 DOM 쿼리와 설정 가능한 감시 주기로 성능 영향을 최소화했습니다.

---

이 확장은 Cursor IDE에서 Agent 채팅의 사용성을 향상시키기 위해 개발되었습니다. 