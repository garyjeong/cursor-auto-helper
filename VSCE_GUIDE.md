# 🚀 VSCE 초보자 완전 가이드

VS Code Extension (VSCE) 도구를 처음 사용하는 분들을 위한 단계별 가이드입니다.

## 📋 목차

1. [VSCE란?](#vsce란)
2. [사전 준비](#사전-준비)
3. [VSCE 설치](#vsce-설치)
4. [Microsoft 계정 설정](#microsoft-계정-설정)
5. [퍼블리셔 생성](#퍼블리셔-생성)
6. [로컬 테스트](#로컬-테스트)
7. [Marketplace 배포](#marketplace-배포)
8. [문제 해결](#문제-해결)

## 🔧 VSCE란?

**VSCE (Visual Studio Code Extension)**는 VSCode 확장을 패키징하고 VS Code Marketplace에 배포하기 위한 공식 명령줄 도구입니다.

### 주요 기능
- ✅ 확장 패키징 (`.vsix` 파일 생성)
- ✅ VS Code Marketplace 배포
- ✅ 확장 메타데이터 검증
- ✅ 버전 관리

## 📝 사전 준비

### 필요한 것들
- [ ] **Node.js** (v16 이상)
- [ ] **npm** 또는 **yarn**
- [ ] **Git** (버전 관리용)
- [ ] **Microsoft 계정** (Azure DevOps용)
- [ ] **VSCode 확장 프로젝트** (이미 있음 ✅)

## 🛠️ VSCE 설치

### 1. 전역 설치
```bash
npm install -g @vscode/vsce
```

### 2. 설치 확인
```bash
vsce --version
# 출력: 3.5.0 (또는 최신 버전)
```

## 🔐 Microsoft 계정 설정

### 1. Azure DevOps 계정 생성

1. **[Azure DevOps](https://dev.azure.com/) 방문**
2. **Microsoft 계정으로 로그인** (없으면 생성)
3. **새 조직 생성** (선택사항)

### 2. Personal Access Token (PAT) 생성

1. **Azure DevOps 로그인 후**:
   - 우상단 사용자 아이콘 클릭
   - **Personal Access Tokens** 선택

2. **+ New Token 클릭**

3. **토큰 설정**:
   ```
   Name: VSCode Extension Publishing
   Organization: All accessible organizations
   Expiration: 1 year (권장)
   Scopes: Custom defined
   ```

4. **Marketplace 권한 설정**:
   - **Marketplace** 섹션 확장
   - **Manage** 체크박스 선택 ✅

5. **Create 클릭**

6. **⚠️ 중요: 생성된 토큰을 안전한 곳에 복사 저장**
   - 이 토큰은 다시 볼 수 없습니다!
   - 예시: `pat_abcd1234efgh5678ijkl9012mnop3456`

## 👤 퍼블리셔 생성

### 1. 웹에서 퍼블리셔 생성

1. **[VS Code Marketplace 퍼블리셔 페이지](https://aka.ms/vscode-create-publisher) 방문**

2. **Microsoft 계정으로 로그인**

3. **퍼블리셔 정보 입력**:
   ```
   Publisher ID: your-unique-id (예: john-doe-extensions)
   Publisher Name: Your Display Name (예: John Doe)
   Email: your-email@example.com
   ```

4. **Create 클릭**

### 2. VSCE 로그인

터미널에서 생성한 퍼블리셔로 로그인:

```bash
vsce login <your-publisher-id>
```

**PAT 토큰 입력 요청 시**: 위에서 생성한 토큰을 붙여넣기

**성공 메시지**:
```
Personal Access Token for publisher 'your-publisher-id': ****
The Personal Access Token verification succeeded for the publisher 'your-publisher-id'.
```

## 🧪 로컬 테스트

### 1. VSIX 패키지 생성

```bash
# 기본 패키지 생성
vsce package

# 특정 이름으로 생성
vsce package --out my-extension-1.0.0.vsix

# 버전 지정하여 생성
vsce package 1.0.1
```

### 2. 로컬 설치 테스트

```bash
# VSCode에 확장 설치
code --install-extension my-extension-1.0.0.vsix

# 설치된 확장 확인
code --list-extensions | grep your-extension-name
```

### 3. 패키지 내용 확인

```bash
# 패키지에 포함된 파일 목록 보기
vsce ls

# 상세 정보 보기
vsce show
```

## 🚀 Marketplace 배포

### 1. 첫 배포

```bash
# 현재 버전으로 배포
vsce publish

# 특정 버전으로 배포
vsce publish 1.0.0

# 버전 업데이트와 함께 배포
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
```

### 2. 배포 확인

1. **VS Code Marketplace에서 확인**:
   - `https://marketplace.visualstudio.com/items?itemName=<publisher>.<extension-name>`

2. **VSCode에서 검색**:
   - Extensions 탭에서 확장 이름 검색

### 3. 업데이트 배포

```bash
# 버그 수정 (patch)
vsce publish patch

# 새 기능 (minor)
vsce publish minor

# 호환성 변경 (major)
vsce publish major
```

## 🔧 문제 해결

### 자주 발생하는 오류

#### 1. **로그인 실패**
```bash
ERROR: Failed to get publisher
```
**해결책**:
- PAT 토큰이 올바른지 확인
- Marketplace 권한이 있는지 확인
- `vsce logout` 후 다시 로그인

#### 2. **패키지 생성 실패**
```bash
ERROR: Make sure to edit the README.md file
```
**해결책**:
- `README.md` 파일 내용 확인
- `package.json`의 필수 필드 확인

#### 3. **배포 실패**
```bash
ERROR: Extension validation failed
```
**해결책**:
- `package.json`의 메타데이터 완성
- 아이콘 파일 추가 (128x128 PNG)
- 라이선스 파일 확인

### 유용한 명령어

```bash
# 로그인 상태 확인
vsce ls

# 로그아웃
vsce logout

# 상세 로그와 함께 배포
vsce publish --verbose

# 패키지 검증
vsce package --verify

# 확장 정보 보기
vsce show <publisher>.<extension-name>

# 확장 제거 (주의!)
vsce unpublish <publisher>.<extension-name>
```

## 📊 배포 후 관리

### 1. 통계 확인

- **VS Code Marketplace**: 다운로드 수, 평점, 리뷰
- **Azure DevOps**: 배포 히스토리

### 2. 업데이트 주기

- **패치 (버그 수정)**: 필요시 즉시
- **마이너 (새 기능)**: 월 1-2회
- **메이저 (호환성 변경)**: 분기별 또는 연간

### 3. 사용자 피드백

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Marketplace 리뷰**: 사용자 평가
- **이메일**: 직접 문의

## 🎯 다음 단계

1. **✅ VSCE 설치 완료**
2. **⏳ Microsoft 계정 및 PAT 토큰 생성**
3. **⏳ 퍼블리셔 생성**
4. **⏳ VSCE 로그인**
5. **⏳ 첫 배포 테스트**

## 📚 추가 자료

- **[VS Code Extension API](https://code.visualstudio.com/api)**
- **[VSCE 공식 문서](https://github.com/microsoft/vscode-vsce)**
- **[Marketplace 가이드라인](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)**
- **[Extension 샘플](https://github.com/microsoft/vscode-extension-samples)**

---

**💡 팁**: 첫 배포는 테스트용으로 `0.0.1` 버전으로 시작하여 모든 과정을 익힌 후, 정식 `1.0.0` 버전을 배포하는 것을 권장합니다! 