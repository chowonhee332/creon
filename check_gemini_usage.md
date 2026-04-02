# Google Gemini API 사용량 확인 방법

## 🔍 Google Cloud Console에서 확인

### 방법 1: API 대시보드에서 확인

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/

2. **프로젝트 선택**
   - 상단에서 프로젝트 선택

3. **API 및 서비스 > 대시보드**
   - 왼쪽 메뉴: "API 및 서비스" > "대시보드"
   - "Generative Language API" 검색
   - 클릭하여 상세 정보 확인

4. **사용량 확인**
   - 요청 수, 오류율 등 확인 가능
   - 시간대별 사용량 그래프 확인

### 방법 2: 할당량(Quota) 페이지에서 확인

1. **할당량 페이지 접속**
   - https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

2. **할당량 정보 확인**
   - 일일 요청 제한
   - 분당 요청 제한
   - 현재 사용량

### 방법 3: 결제 및 사용량 확인

1. **결제 페이지 접속**
   - https://console.cloud.google.com/billing

2. **사용량 보고서 확인**
   - 프로젝트별 사용량
   - 비용 추정

## 📊 Google AI Pro 요금제 정보

### 일반적인 제한사항 (참고)
- **일일 요청 제한**: 프로 요금제에 따라 다름
- **분당 요청 제한**: 보통 60-300 requests/minute
- **토큰 제한**: 요청당 토큰 수 제한

### 실제 제한 확인 방법
Google Cloud Console에서 정확한 제한을 확인하세요:
- 할당량 페이지에서 프로젝트별 제한 확인
- API 키별 제한 설정 확인

## ⚠️ 중요 사항

1. **API 키 제한 설정**
   - Google Cloud Console > API 및 서비스 > 사용자 인증 정보
   - API 키 선택 > 제한사항 설정
   - 애플리케이션 제한사항 설정 권장

2. **사용량 모니터링**
   - 알림 설정으로 사용량 임계값 초과 시 알림 받기
   - 예상치 못한 비용 방지

3. **할당량 초과 시**
   - 일일 할당량 초과: 다음 날까지 대기
   - 분당 할당량 초과: 잠시 후 재시도
   - 프로 요금제 업그레이드 고려

## 🔗 유용한 링크

- API 대시보드: https://console.cloud.google.com/apis/dashboard
- 할당량 페이지: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
- 결제 페이지: https://console.cloud.google.com/billing
- API 문서: https://ai.google.dev/docs

