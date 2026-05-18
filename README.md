# 한우마루 (farm-tech)

한우 스마트팜 관리와 농산물 직거래를 하나의 앱에서 제공하는 React Native 모바일 앱입니다.  
IoT 센서 실시간 모니터링·원격 제어부터 상품 주문·결제까지 통합 플랫폼을 구현했습니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React Native 0.81 (Expo ~54) |
| 라우팅 | Expo Router v6 — 파일 기반 라우팅, typed routes |
| 스타일 | NativeWind v4 (TailwindCSS) |
| 상태관리 | Zustand v5 |
| HTTP 클라이언트 | Axios + 인터셉터 (자동 토큰 갱신) |
| 실시간 통신 | STOMP over WebSocket (`@stomp/stompjs`) |
| 결제 | 토스페이먼츠 (`@tosspayments/widget-sdk-react-native`) |
| 푸시 알림 | Expo Notifications + FCM |
| 보안 저장소 | Expo SecureStore (iOS Keychain / Android Keystore) |
| 언어 | TypeScript |

---

## 주요 기능 상세

### 1. IoT 대시보드 — 3단계 데이터 소스 전략

Raspberry Pi와의 연결 상태에 따라 3가지 모드로 자동 전환됩니다.

| 모드 | 상황 | 동작 |
|------|------|------|
| `LIVE` | Pi 정상 연결 | 실시간 센서값 표시, 배너 없음 |
| `DB_FALLBACK` | Pi 오프라인 | DB에 마지막으로 저장된 값 표시 + 경고 배너 |
| `DB_ERROR` | DB까지 오프라인 | 데이터 없음 안내 + 경고 배너 |

온도(°C), 습도(%), 조도(lux), 대기질(raw) 4가지 센서를 카드 그리드로 표시하며, LIVE 상태에서는 LED·환풍기·부저의 현재 상태(ON/OFF, 밝기/속도/주파수)도 함께 표시합니다.

---

### 2. IoT 기기 원격 제어 — 자동/수동 모드

**자동 모드**: 임계값 프리셋 기준으로 백엔드가 기기를 자동 제어합니다.  
**수동 모드**: 앱에서 직접 LED·환풍기·부저를 ON/OFF 제어합니다.

- LED 밝기 (10~100%), 환풍기 속도 (10~100%), 부저 주파수 (200~2000 Hz) 를 스텝퍼 UI로 조절
- 화면 포커스 진입 시 3초 간격 폴링으로 기기 상태를 자동 갱신, 화면 이탈 시 폴링 자동 중단
- 임계값 프리셋(활성 프리셋 이름, 온도·습도·조도·대기질 범위)을 동일 화면에서 확인 및 이동

---

### 3. 인증 시스템 — JWT + Silent Refresh

- 로그인 시 Access Token과 Refresh Token을 **Expo SecureStore**(OS 수준 암호화 저장소)에 저장
- 앱 재시작 시 SecureStore에서 토큰을 복원해 자동 로그인 유지 (30일 rolling)
- **Axios 응답 인터셉터**로 401 발생 시 Refresh Token으로 Access Token을 자동 재발급
  - 갱신 중 중복 요청 방지 (`isRefreshing` 플래그로 직렬화)
  - Refresh Token까지 만료 시 Zustand 상태 초기화 후 로그인 화면으로 이동
- **역할 기반 접근 제어**: JWT payload를 클라이언트에서 직접 디코딩해 `MANAGER` / `USER` role 구분  
  → `MANAGER` 전용 탭(대시보드, 기기제어)은 role 검증 후 자동 리다이렉트

---

### 4. 상품 쇼핑 — 검색·장바구니·결제

- 상품 목록 검색, 상세 조회, 장바구니 담기·수량 변경
- **토스페이먼츠 위젯 SDK** 연동으로 앱 내 결제 처리
- 결제 완료 후 주문 내역 확인, 배송 상태 조회

---

### 5. 실시간 채팅 — STOMP over WebSocket

- `@stomp/stompjs`를 사용한 STOMP 프로토콜 기반 실시간 양방향 채팅
- 마이페이지 내 채팅 화면에서 농장주·구매자 간 문의 지원

---

### 6. 푸시 알림 — FCM

- Expo Notifications + Firebase Cloud Messaging으로 푸시 알림 수신
- 로그인 시 FCM 토큰을 서버에 등록, 알림 수신 시 Zustand 알림 목록에 실시간 추가
- 읽지 않은 알림은 탭 배지로 표시

---

### 7. 전역 상태 관리 — Zustand

Zustand 단일 스토어(`authStore`)에서 다음을 통합 관리합니다.

- 인증 상태 (token, role, isAuthReady)
- 장바구니 상품 수 (탭 배지 연동)
- 알림 목록 (추가·삭제)
- 전역 Alert 모달 / Toast 메시지

---

## 프로젝트 구조

```
farm-tech/
├── app/                        # 화면 (Expo Router 파일 기반 라우팅)
│   ├── (tabs)/                 # 하단 탭
│   │   ├── home.tsx            # 홈
│   │   ├── cart.tsx            # 장바구니
│   │   ├── dashboard.tsx       # IoT 대시보드 (MANAGER)
│   │   ├── data.tsx            # 센서 데이터 분석 (MANAGER)
│   │   ├── device-control.tsx  # 기기 원격 제어 (MANAGER)
│   │   └── mypage.tsx          # 마이페이지
│   ├── auth/                   # 로그인, 회원가입
│   ├── product/                # 상품 상세, 결제, 주문 완료
│   ├── order/                  # 주문 목록, 상세
│   ├── mypage/                 # 프로필, 리뷰, 채팅, 비밀번호 변경
│   └── manager/                # 임계값 프리셋 관리
├── src/
│   ├── api/                    # Axios API 모듈 (도메인별 분리)
│   │   ├── axiosInstance.ts    # 인터셉터 (토큰 자동 첨부·갱신)
│   │   ├── authApi.ts          # 인증 (로그인·회원가입·찾기)
│   │   ├── iotApi.ts           # IoT 센서·액추에이터 제어
│   │   ├── cartApi.ts          # 장바구니
│   │   ├── orderApi.ts         # 주문
│   │   ├── paymentApi.ts       # 결제
│   │   ├── productApi.ts       # 상품
│   │   ├── reviewApi.ts        # 리뷰
│   │   ├── chatApi.ts          # 채팅
│   │   ├── notificationApi.ts  # 알림
│   │   └── thresholdApi.ts     # 임계값 프리셋
│   ├── components/             # 공통·도메인별 컴포넌트
│   ├── hooks/                  # 커스텀 훅 (useAuth, useCart, useCheckout 등)
│   ├── store/                  # Zustand 전역 상태
│   ├── types/                  # TypeScript 타입 정의
│   ├── constants/              # BASE_URL 등 상수
│   └── utils/                  # 유틸리티 함수
└── assets/                     # 이미지, 아이콘, 폰트
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- Android Studio (에뮬레이터) 또는 실제 Android 기기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env에서 EXPO_PUBLIC_API_URL을 백엔드 서버 주소로 수정

# 개발 서버 시작
npm start

# Android 실행
npm run android
```

### 환경변수

```env
# ipconfig 명령어로 본인 IPv4 주소 확인 후 입력
EXPO_PUBLIC_API_URL=http://본인IP:포트
```

---

## 팀원

| 이름 | 담당 기능 |
|------|-----------|
| 최유정 | IoT 대시보드, 센서 데이터 분석, 기기 원격 제어, 임계값 설정 |
| 허준일 | 장바구니, 마이페이지 |
| 백대훈 | 상품 리뷰 |
