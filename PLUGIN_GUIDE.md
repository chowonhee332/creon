# Creon 플러그인 가이드

Antigravity 서비스에 Creon을 플러그인 형태로 통합하는 방법입니다.

## 방법 1: Web Component (권장)

가장 유연하고 격리된 방식입니다. React, Vue, Angular 등 어떤 프레임워크와도 호환됩니다.

### 사용 예시

```html
<!-- Antigravity 서비스에 추가 -->
<creon-studio 
  api-key="YOUR_GEMINI_API_KEY"
  default-studio="image"
  theme="light">
</creon-studio>
```

### 구현 방법

1. Web Component 래퍼 생성
2. Creon의 모든 기능을 Shadow DOM으로 격리
3. 이벤트를 통해 부모 앱과 통신

---

## 방법 2: React 컴포넌트 (React 기반 서비스용)

Antigravity가 React 기반이라면 이 방법이 가장 간단합니다.

### 사용 예시

```tsx
import { CreonStudio } from '@creon/plugin-react';

function MyAntigravityApp() {
  return (
    <CreonStudio
      apiKey="YOUR_GEMINI_API_KEY"
      defaultStudio="image"
      theme="light"
      onImageGenerated={(image) => {
        // 생성된 이미지 처리
        console.log('Image generated:', image);
      }}
    />
  );
}
```

---

## 방법 3: iframe 임베드 (가장 간단)

별도의 도메인에서 Creon을 호스팅하고 iframe으로 임베드합니다.

### 사용 예시

```html
<iframe 
  src="https://creon.yourdomain.com/embed?apiKey=YOUR_KEY&studio=image"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

### 장점
- 완전한 격리
- 별도 배포 가능
- 보안 이슈 최소화

### 단점
- 통신이 제한적 (postMessage 사용)
- 스타일 커스터마이징 어려움

---

## 방법 4: npm 패키지

Creon을 npm 패키지로 배포하고 Antigravity에서 설치합니다.

### 설치

```bash
npm install @creon/studio-plugin
```

### 사용 예시

```tsx
import { initCreon } from '@creon/studio-plugin';

const creon = initCreon({
  container: '#creon-container',
  apiKey: 'YOUR_GEMINI_API_KEY',
  config: {
    defaultStudio: 'image',
    theme: 'light',
    showHeader: false, // Antigravity의 헤더 사용
  }
});

// 이벤트 리스너
creon.on('imageGenerated', (data) => {
  console.log('Image:', data);
});
```

---

## 추천 구현 방법

현재 Creon의 구조를 보면 **방법 1 (Web Component)** 또는 **방법 4 (npm 패키지)**를 추천합니다.

### 구현 단계

1. **플러그인 래퍼 생성**
   - Creon의 초기화 로직을 래핑
   - API 키와 설정을 외부에서 주입받도록 수정

2. **스타일 격리**
   - CSS를 Shadow DOM으로 격리하거나
   - CSS 변수를 통해 테마 커스터마이징 가능하게

3. **이벤트 시스템**
   - 생성된 이미지/비디오를 부모 앱에 전달
   - 부모 앱에서 Creon 제어 가능

4. **헤더/네비게이션 제거 옵션**
   - Antigravity의 UI에 통합할 수 있도록 헤더 숨김 옵션

---

## 다음 단계

어떤 방법으로 진행할지 알려주시면, 해당 방법에 맞춰 플러그인 구조를 만들어드리겠습니다!
