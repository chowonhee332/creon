# Vercel 배포 가이드

## 🚀 Vercel에 배포하는 방법

### 1단계: GitHub에 코드 푸시 (이미 완료된 경우 생략)

```bash
# 현재 변경사항 커밋
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2단계: Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 가입**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 Import**
   - Vercel 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (기본값)
     - **Build Command**: `npm run build` (자동 감지)
     - **Output Directory**: `dist` (자동 감지)

3. **환경 변수 설정** ⚠️ **중요**
   - "Environment Variables" 섹션에서 추가:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: 실제 API 키 값
     - **Environment**: Production, Preview, Development 모두 선택
   - ⚠️ **주의**: `VITE_` 접두사를 붙이지 마세요! (서버에서만 사용)

### 3단계: 배포

1. "Deploy" 버튼 클릭
2. 배포 완료까지 대기 (약 2-3분)
3. 배포 완료 후 자동으로 URL 제공:
   - 예: `https://your-project-name.vercel.app`

### 4단계: 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 연결

---

## ⚠️ API 키 보안 주의사항

### 현재 문제점
현재 코드는 API 키가 클라이언트에 노출될 수 있습니다:
- `vite.config.ts`에서 `VITE_` 접두사 사용 시 클라이언트 번들에 포함됨
- 브라우저 개발자 도구에서 확인 가능

### 해결 방법 (권장)

#### 옵션 1: Vercel Serverless Functions 사용 (권장)

1. **API 라우트 생성**
   ```
   api/
     generate.ts
   ```

2. **환경 변수는 서버에서만 접근**
   - Vercel 환경 변수에 `GEMINI_API_KEY` 설정
   - 클라이언트는 `/api/generate` 엔드포인트만 호출

#### 옵션 2: Google Cloud Console에서 API 키 제한

1. Google Cloud Console 접속
2. API 및 서비스 → 사용자 인증 정보
3. API 키 선택 → 제한사항 설정:
   - **애플리케이션 제한사항**: HTTP 리퍼러(웹사이트)
   - **웹사이트 제한사항**: Vercel 도메인 추가
     - `https://your-project.vercel.app/*`
     - `https://*.vercel.app/*` (프리뷰 배포용)

---

## 📝 배포 후 확인사항

- [ ] 사이트가 정상적으로 로드되는지 확인
- [ ] Home 페이지 콘텐츠가 표시되는지 확인
- [ ] 이미지 생성 기능이 작동하는지 확인
- [ ] API 키가 브라우저에서 노출되지 않는지 확인 (개발자 도구 → Sources)

---

## 🔄 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포됩니다:
- `main` 브랜치 → Production 배포
- 다른 브랜치 → Preview 배포

---

## 🐛 문제 해결

### 빌드 실패 시
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. Vercel 빌드 로그 확인
3. 환경 변수 설정 확인

### API 키 오류 시
1. Vercel 환경 변수 설정 확인
2. Google Cloud Console에서 API 키 상태 확인
3. API 키 사용량 제한 확인

---

## 📞 추가 도움말

- Vercel 문서: https://vercel.com/docs
- Vite 배포 가이드: https://vitejs.dev/guide/static-deploy.html

