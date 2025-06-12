# Cursor Auto Resumer - 프로젝트 컨텍스트

## 프로젝트 개요

Cursor Auto Resumer는 Cursor IDE에서 Agent 채팅 패널의 Resume 및 Skip 버튼을 자동으로 감지하고 클릭하는 VSCode 확장입니다. 이 확장은 사용자가 Agent와의 대화를 중단 없이 계속할 수 있도록 도와줍니다.

## 핵심 기능

### 1. 자동 Resume 버튼 감지
- CSS 선택자와 텍스트 패턴을 사용하여 Resume 버튼 자동 감지
- 발견 즉시 자동 클릭
- 다양한 언어 지원 (영어, 한국어)
- 사용자 정의 선택자 추가 가능

### 2. 자동 Skip 버튼 감지 (신규 기능)
- CSS 선택자와 텍스트 패턴을 사용하여 Skip 버튼 자동 감지
- 설정 가능한 지연 시간 후 자동 클릭 (기본: 5초)
- Resume 버튼이 나타나면 Skip 클릭 취소
- 독립적인 활성화/비활성화 설정

### 3. 실시간 모니터링
- Agent 패널 실시간 스캔
- DOM 변경 감지를 통한 즉시 반응
- 설정 가능한 체크 간격 (500ms - 10초)

### 4. 사용자 인터페이스
- 상태 표시줄 통합 (Resume/Skip 상태 표시)
- 명령 팔레트 지원
- 설정을 통한 세부 조정

## 아키텍처

### 파일 구조
```
cursor-auto-resumer/
├── src/
│   ├── types.ts           # TypeScript 타입 정의 (Skip 버튼 타입 추가)
│   ├── config.ts          # 설정 관리 클래스 (Skip 설정 추가)
│   ├── webviewScript.ts   # 웹뷰 DOM 모니터링 스크립트 (Skip 로직 추가)
│   ├── agentWatcher.ts    # 메인 감시 로직 (Skip 통합)
│   └── extension.ts       # 확장 진입점 (Skip 명령어 추가)
├── tests/
│   ├── extension.test.ts  # 확장 기능 테스트 (Skip 테스트 추가)
│   └── agentWatcher.test.ts # AgentWatcher 클래스 테스트
├── out/                   # 컴파일된 JavaScript 파일
├── .vscode/
│   └── launch.json        # 디버그 설정
├── package.json           # 확장 메타데이터 및 의존성 (Skip 설정 추가)
├── tsconfig.json          # TypeScript 설정
├── jest.config.js         # 테스트 설정
├── .eslintrc.js          # 코드 품질 설정
└── README.md             # 사용자 문서
```

### 주요 클래스

#### 1. ConfigManager (src/config.ts)
- 싱글톤 패턴으로 구현
- VSCode 설정 관리
- 설정 검증 및 로깅
- **Skip 버튼 설정 관리 추가**

#### 2. AgentWatcher (src/agentWatcher.ts)
- 메인 감시 로직
- 탭 스캔 및 패널 관리
- 상태 표시줄 업데이트
- **Skip 버튼 통계 및 상태 관리 추가**

#### 3. WebviewScript (src/webviewScript.ts)
- DOM 모니터링 스크립트 생성
- MutationObserver를 사용한 실시간 감지
- 버튼 클릭 자동화
- **Skip 버튼 지연 클릭 로직 추가**

## 기술 스택

### 개발 환경
- **언어**: TypeScript 4.9.4
- **플랫폼**: VSCode Extension API 1.74.0
- **빌드 도구**: TypeScript Compiler
- **테스트**: Jest 29.5.0
- **코드 품질**: ESLint + TypeScript ESLint

### 런타임 의존성
- VSCode Extension API
- Node.js 16.x

## 설정 옵션

### Resume 버튼 설정
- **cursorAutoResumer.enabled**: 자동 Resume 기능 활성화/비활성화
- **cursorAutoResumer.checkInterval**: 체크 간격 (500-10000ms)
- **cursorAutoResumer.customSelectors**: 사용자 정의 CSS 선택자
- **cursorAutoResumer.debugMode**: 디버그 로깅 활성화

### Skip 버튼 설정 (신규)
- **cursorAutoResumer.skipButtonEnabled**: Skip 버튼 기능 활성화/비활성화
- **cursorAutoResumer.skipButtonDelay**: Skip 버튼 클릭 지연 시간 (1000-30000ms)
- **cursorAutoResumer.skipButtonCustomSelectors**: Skip 버튼 사용자 정의 선택자

## 명령어

### 기존 명령어
1. `cursorAutoResumer.enable` - 확장 활성화
2. `cursorAutoResumer.disable` - 확장 비활성화
3. `cursorAutoResumer.checkNow` - 즉시 체크 실행
4. `cursorAutoResumer.toggleDebug` - 디버그 모드 토글
5. `cursorAutoResumer.addCustomSelector` - 사용자 정의 선택자 추가
6. `cursorAutoResumer.showStatus` - 현재 상태 표시

### 신규 명령어 (Skip 버튼)
7. `cursorAutoResumer.enableSkip` - Skip 버튼 기능 활성화
8. `cursorAutoResumer.disableSkip` - Skip 버튼 기능 비활성화
9. `cursorAutoResumer.setSkipDelay` - Skip 버튼 지연 시간 설정

## 동작 플로우

### 버튼 감지 우선순위
1. **Resume 버튼**: 최우선 - 발견 즉시 클릭
2. **Skip 버튼**: 차순위 - 지연 시간 후 클릭
3. **우선순위 로직**: Resume 버튼이 나타나면 Skip 타이머 즉시 취소

### 타이머 관리
- Skip 버튼 발견 시 지연 타이머 시작
- Resume 버튼 발견 시 Skip 타이머 즉시 취소
- 중복 타이머 방지 로직

## 개발 워크플로우

### 1. 개발 환경 설정
```bash
npm install
npm run compile
```

### 2. 디버깅
- F5 키를 눌러 Extension Development Host 실행
- 브레이크포인트 설정 및 디버깅

### 3. 테스트 실행
```bash
npm test
```

### 4. 린팅
```bash
npm run lint
```

### 5. 패키징
```bash
npm run package
```

## 설치 방법

### 1. 로컬 VSIX 설치
```bash
npm run package
code --install-extension cursor-auto-resumer-1.0.0.vsix
```

### 2. 개발자 모드
1. VSCode에서 `Ctrl+Shift+P` (또는 `Cmd+Shift+P`)
2. "Extensions: Install from VSIX..." 선택
3. 생성된 .vsix 파일 선택

### 3. 심볼릭 링크 (개발용)
```bash
ln -s /path/to/cursor-auto-resumer ~/.vscode/extensions/cursor-auto-resumer
```

## 보안 고려사항

### DOM 조작
- 웹뷰 스크립트는 안전한 DOM 조작만 수행
- 사용자 데이터 접근 없음
- 클릭 쿨다운으로 과도한 동작 방지
- **Skip 버튼 타이머 관리로 중복 클릭 방지**

### 권한
- 최소 권한 원칙 적용
- 필요한 VSCode API만 사용

## 성능 최적화

### 메모리 관리
- 적절한 리소스 정리 (dispose 패턴)
- 타이머 및 이벤트 리스너 정리
- **Skip 타이머 적절한 정리**

### CPU 사용량
- 설정 가능한 체크 간격
- 효율적인 DOM 쿼리
- **Resume/Skip 버튼 우선순위 최적화**

## 향후 개선 사항

### 1. 고급 패턴 매칭
- 정규식 기반 텍스트 매칭 개선
- AI 기반 버튼 인식

### 2. 다국어 지원 확장
- 더 많은 언어 패턴 추가
- 지역화 설정

### 3. 통계 및 분석
- 사용 통계 수집
- 성능 메트릭
- **Resume/Skip 버튼 클릭 통계**

### 4. 사용자 경험 개선
- GUI 설정 패널
- 실시간 미리보기
- **Skip 타이머 시각적 표시**

## 문제 해결

### 일반적인 문제
1. **확장이 활성화되지 않음**: VSCode 재시작 필요
2. **Resume 버튼을 찾지 못함**: 사용자 정의 선택자 추가
3. **Skip 버튼을 찾지 못함**: Skip 사용자 정의 선택자 추가
4. **성능 문제**: 체크 간격 조정
5. **Skip 타이머 문제**: 지연 시간 설정 확인

### 새로운 기능 관련 문제
- **Skip 버튼이 클릭되지 않음**: skipButtonEnabled 설정 확인
- **지연 시간이 작동하지 않음**: skipButtonDelay 범위 확인 (1-30초)
- **Resume 우선순위 문제**: 로그에서 타이머 취소 메시지 확인

## 라이선스

MIT License - 자유로운 사용 및 수정 가능

## 기여 방법

1. 이슈 리포트
2. 기능 제안
3. 풀 리퀘스트
4. 문서 개선

---

이 문서는 Cursor Auto Resumer 프로젝트의 전체적인 맥락을 제공합니다. 개발, 사용, 유지보수에 필요한 모든 정보를 포함하고 있습니다. 