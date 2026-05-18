# 🥩 한우마루 - 스마트팜 한우 쇼핑몰 앱

> 최고의 한우를 스마트팜에서 식탁까지 — FarmTech 팀의 한우 전문 쇼핑몰 모바일 앱

IoT 센서로 관리되는 스마트 축사에서 생산된 한우를 판매하는 모바일 쇼핑몰입니다.  
실시간 SSE 알림, FCM 푸시 알림, WebSocket 1:1 문의 채팅, 스마트팜 IoT 모니터링/제어 기능을 제공합니다.

---

## 👥 팀원

| 이름 | GitHub | 역할 |
|------|--------|------|
| 최유정 | [@kanonphil](https://github.com/kanonphil) | 풀스택 |
| 백대훈 | [@qoreogns3](https://github.com/qoreogns3) | 풀스택 |
| 허준일 | [@sogb7244](https://github.com/sogb7244) | 풀스택 |

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **App** | React Native (Expo), TypeScript, NativeWind |
| **Backend** | Spring Boot 3, Java 17, MyBatis, Spring Security |
| **Database** | MariaDB |
| **상태관리** | Zustand |
| **인증** | JWT (Access Token + Refresh Token), BCrypt, HttpOnly Cookie |
| **실시간 통신** | SSE (Server-Sent Events), WebSocket STOMP |
| **푸시 알림** | Firebase FCM |
| **결제** | 토스페이먼츠 (TossPayments, WebView 방식) |
| **IoT** | Raspberry Pi, Python3, FastAPI, MariaDB 센서 연동 |
| **빌드** | Gradle, Expo EAS |

---

## ✨ 주요 기능

### 🛒 쇼핑몰

메인 홈페이지에서 배너, 추천 상품을 확인할 수 있습니다.

![홈 화면](https://github.com/user-attachments/assets/2b52a1b3-a127-4644-9c35-721b166fa52d)

한우 상품 목록을 카테고리별로 필터링하고 검색어 자동완성을 통해 상품을 찾을 수 있습니다.

![검색](https://github.com/user-attachments/assets/7bbd1202-9892-4187-9193-61ad2c463f1d)

상품 상세 페이지에서 이미지 갤러리, 수량 선택, 바로 구매 / 장바구니 담기가 가능합니다.

![상품 상세](https://github.com/user-attachments/assets/9442452c-4977-4763-a133-5a30d34fcae0)

---

### 🛍️ 주문 / 결제

장바구니에서 상품을 선택하고 토스페이먼츠로 결제할 수 있습니다.  
결제 이탈 시 주문이 자동으로 취소 처리됩니다.

| 장바구니 | 주문서 | 결제 완료 |
|:--------:|:------:|:---------:|
| ![장바구니](https://github.com/user-attachments/assets/d0131ded-2281-42cf-ab45-24a020dbcfaf) | ![주문서](https://github.com/user-attachments/assets/dc53ca5a-58df-4d43-8508-0d5f40c71ed1) | ![결제완료](https://github.com/user-attachments/assets/48788ec5-078f-43b2-91d1-f0586be0fc82) |

---

### 👤 마이페이지

주문 내역 조회, 구매 확정, 주문 취소가 가능합니다.

![주문 내역](https://github.com/user-attachments/assets/d08bc96b-3b3b-4725-a799-9e9e089f0f2e)

구매한 상품에 별점과 리뷰를 작성하고 판매자 답글을 확인할 수 있습니다.  
답글이 달리면 SSE 실시간 알림 및 FCM 푸시 알림이 발송됩니다.

![리뷰 작성](https://github.com/user-attachments/assets/5ce2dabf-5f09-4a1f-91dd-f27c7b526e32)

회원정보 수정, 비밀번호 변경, 회원탈퇴 기능을 제공합니다.

![마이페이지](https://github.com/user-attachments/assets/43005932-b12a-49f8-81a4-5e34b2e8c870)

---

### 💬 1:1 문의 채팅

WebSocket STOMP 기반의 실시간 1:1 문의 채팅을 이용할 수 있습니다.  
JWT 채널 인증을 통해 인증된 사용자만 접근할 수 있습니다.

![채팅](https://github.com/user-attachments/assets/4a00e7fd-b5da-41b3-80e0-ddd81b369cc2)

---

### 🔔 실시간 알림

배송 완료, 답글 등록 시 SSE 실시간 알림 및 FCM 푸시 알림을 수신할 수 있습니다.

![알림](https://github.com/user-attachments/assets/fdc618c4-5178-4c1a-bad6-69fb036b5ce9)

---

### 🌿 스마트팜 IoT (매니저 전용)

축사 현황을 대시보드에서 한눈에 확인할 수 있습니다.

![대시보드](https://github.com/user-attachments/assets/ee052efc-938f-438a-aa44-b079111a9397)

온도·습도·조도·대기질(CO₂) 센서 데이터를 기간별로 조회하고 시계열 차트로 시각화합니다.

![센서 데이터 차트](https://github.com/user-attachments/assets/f4c8065a-3067-43a6-a69a-e918f0ba005c)

LED 밝기, 팬 속도, 부저 등 액추에이터를 수동/자동 모드로 제어합니다.

![기기 제어](https://github.com/user-attachments/assets/2723f785-87e4-4073-8563-95d33115234f)

센서별 임계값을 설정하여 자동 제어 기준을 관리할 수 있습니다.

![임계값 설정](https://github.com/user-attachments/assets/a60158cf-1a61-46c4-aa40-c0c7787b0086)

---

## ⚙️ 설치 및 실행

### 1. 앱 (Frontend)

```bash
npm install
npx expo start
```

`.env` 설정:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_SERVER_IP:8080
EXPO_PUBLIC_TOSS_CLIENT_KEY=YOUR_TOSS_CLIENT_KEY
```

### 2. Backend

```bash
cd backend
./gradlew bootRun
```

`src/main/resources/application.properties` 설정:

```properties
# DB
spring.datasource.url=jdbc:mariadb://YOUR_DB_HOST:3306/YOUR_DB
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD

# JWT
jwt.secret=YOUR_JWT_SECRET

# TossPayments
toss.secret.key=YOUR_TOSS_SECRET_KEY

# Firebase FCM
firebase.credentials.path=YOUR_FIREBASE_JSON_PATH
```

---

## 📁 프로젝트 구조

```
farm-tech-app/
├── app/
│   ├── (tabs)/          # 탭 네비게이션 (홈, 장바구니, 마이페이지 / 대시보드, 기기제어, 데이터)
│   ├── auth/            # 로그인, 회원가입
│   ├── mypage/          # 주문내역, 리뷰, 채팅, 프로필, 회원정보수정
│   ├── order/           # 주문서, 결제, 완료
│   ├── product/         # 상품 상세
│   ├── manager/         # 임계값 설정
│   ├── notification/    # 알림 목록
│   └── search/          # 검색
└── src/
    ├── api/             # Axios API 모듈
    ├── components/      # 공통 컴포넌트
    ├── store/           # Zustand 전역 상태
    ├── types/           # TypeScript 타입 정의
    └── constants/       # 상수 및 색상
```

---

## 📄 라이선스

This project is for educational purposes.
