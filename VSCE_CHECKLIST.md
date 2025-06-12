# ✅ VSCE 초보자 체크리스트

## 🚀 **첫 배포까지 단계별 체크리스트**

### **1단계: 환경 설정**
- [ ] Node.js 설치 확인 (`node --version`)
- [ ] VSCE 설치 (`npm install -g @vscode/vsce`)
- [ ] VSCE 버전 확인 (`vsce --version`)

### **2단계: Microsoft 계정 준비**
- [ ] Microsoft 계정 생성/로그인
- [ ] [Azure DevOps](https://dev.azure.com/) 접속
- [ ] Personal Access Token (PAT) 생성
  - [ ] Name: `VSCode Extension Publishing`
  - [ ] Expiration: `1 year`
  - [ ] Scopes: `Custom defined`
  - [ ] Marketplace → `Manage` 체크 ✅
- [ ] PAT 토큰 안전한 곳에 저장

### **3단계: 퍼블리셔 생성**
- [ ] [VS Code Marketplace 퍼블리셔 페이지](https://aka.ms/vscode-create-publisher) 방문
- [ ] 퍼블리셔 정보 입력:
  - [ ] Publisher ID (고유한 ID)
  - [ ] Publisher Name (표시될 이름)
  - [ ] Email (연락처)
- [ ] 퍼블리셔 생성 완료

### **4단계: VSCE 로그인**
- [ ] 터미널에서 로그인: `vsce login <your-publisher-id>`
- [ ] PAT 토큰 입력
- [ ] 로그인 성공 메시지 확인

### **5단계: 로컬 테스트**
- [ ] VSIX 패키지 생성: `vsce package`
- [ ] 패키지 파일 생성 확인 (`.vsix` 파일)

- [ ] 로컬 설치 테스트: `code --install-extension *.vsix`
- [ ] VSCode에서 확장 동작 확인

### **6단계: 첫 배포**
- [ ] 프로젝트 메타데이터 확인:
  - [ ] `package.json` 필수 필드 완성
  - [ ] `README.md` 내용 작성
  - [ ] `LICENSE` 파일 존재
- [ ] 첫 배포 실행: `vsce publish`
- [ ] 배포 성공 메시지 확인
- [ ] Marketplace에서 확장 확인

## 🔧 **필수 명령어 모음**

```bash
# VSCE 설치
npm install -g @vscode/vsce

# 버전 확인
vsce --version

# 로그인
vsce login <publisher-id>

# 패키지 생성
vsce package

# 로컬 설치
code --install-extension *.vsix

# 배포
vsce publish

# 로그인 상태 확인
vsce ls

# 로그아웃
vsce logout
```

## ⚠️ **주의사항**

- **PAT 토큰**: 생성 후 즉시 안전한 곳에 저장 (다시 볼 수 없음)
- **퍼블리셔 ID**: 한 번 생성하면 변경 불가
- **첫 배포**: 테스트용 `0.0.1` 버전으로 시작 권장
- **메타데이터**: `package.json`의 모든 필수 필드 작성 필요

## 🆘 **문제 발생 시**

1. **로그인 실패**: PAT 토큰과 Marketplace 권한 확인
2. **패키지 실패**: `README.md`와 `package.json` 확인
3. **배포 실패**: 메타데이터와 라이선스 파일 확인

## 📞 **도움이 필요하면**

- [VSCE 공식 문서](https://github.com/microsoft/vscode-vsce)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Marketplace 가이드라인](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**🎯 목표**: 이 체크리스트를 따라하면 첫 VSCode 확장 배포까지 완료할 수 있습니다! 