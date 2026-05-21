# Notion Workspace Inventory
Generated: 2026-05-19 | Excludes: 작업 일지

---

## Summary

- Total databases found: 52 (including 작업 일지)
- Inventoried: 51 databases
- Total meaningful unique databases: ~24 logical groups
- Sub-databases (📁 folder-type, per-member): ~21 (3 sets × 7 layers)
- Empty databases: 5
- Duplicate databases: 5 (API 명세서 copies)

---

## Databases

---

### 1. API 명세서 (1) — ×3 copies
**IDs:** `34c9f0d4-...-8189`, `34c9f0d4-...-81f2`, `34c9f0d4-...-81a5`
**Purpose:** Member API endpoint documentation
**Pages (each):** 13–14
**Titles (same in all 3):**
- 회원가입 POST /members
- 로그인 POST /members/login
- 로그아웃 POST /members/logout
- 이메일 중복 확인 GET /members/check-email
- 이메일 찾기 POST /members/find-email
- 계정 인증 POST /members/verify-account
- 비밀번호 확인 POST /members/confirm-pw
- 비밀번호 변경 PATCH /members/set-pw
- 비밀번호 재설정 PATCH /members/reset-pw
- 내 정보 조회 GET /members/user
- 이메일로 회원 조회 GET /members/{memEmail}
- 내 정보 수정 PUT /members/set-info
- 액세스 토큰 갱신 POST /members/refresh
- 회원 탈퇴 PATCH /members/withdraw

**Duplicates:** All 3 are identical content — 2 of them are redundant
**Archive:** 2 of the 3 copies
**Portfolio:** ✅ Keep 1 (well-structured REST API docs)

---

### 2. API 명세서 — ×2 copies (different content)
**IDs:** `34c9f0d4-...-81fe` (Sensor), `34c9f0d4-...-8113` (Actuator original)

#### 2a. API 명세서 — Sensor API
**Pages:** 2
- 최신 센서 데이터 조회 GET /sensors
- 기간별 센서 이력 조회 GET /sensors/history

**Portfolio:** ✅

#### 2b. API 명세서 — Actuator API (original)
**Pages:** 9
- 제어 모드 조회/설정 GET|POST /api/actuator/mode
- LED 켜기/끄기 POST /api/actuator/led/on|off
- 팬 켜기/끄기 POST /api/actuator/fan/on|off
- 부저 켜기/끄기 POST /api/actuator/buzzer/on|off
- 전체 상태 조회 GET /api/actuator/status

**Portfolio:** ✅

---

### 3. etc
**Purpose:** Unknown (miscellaneous)
**Pages:** 0 (empty)
**Archive:** ✅ (empty, no value)

---

### 4. MEMBER
**Purpose:** Spring Boot member/auth code documentation
**Pages:** 5
- MemberService.java — 회원 비즈니스 로직 (JWT + BCrypt)
- authStore.js — Zustand 인증 & 알림 & 모달 전역 상태 관리
- RequireAuth.jsx — 비로그인 시 자동 리다이렉트 라우트 가드
- 🔑 JWT 인증 시스템 — JwtUtil / JwtConfirmFilter / LoginFilter
- 🔐 SecurityConfig.java — Spring Security 필터 체인 & 권한 설정

**Duplicates:** SecurityConfig.java also exists in SPRING BOOT DB — possible overlap
**Portfolio:** ✅ (JWT, Spring Security, Zustand — strong tech stack)

---

### 5. REACT
**Purpose:** React (web + RN) frontend code documentation
**Pages:** 7
- notificationApi.ts — SSE fetchEventSource & 5회 재시도 & FCM 통합
- TossPaymentWebView.tsx — WebView 결제 & 이탈 취소 & intent:// 처리
- device-control.tsx — 기기제어 탭 상태 보존 & 백그라운드 폴링
- authStore.ts — Zustand JWT 디코딩 & SecureStore 토큰 복원
- 한우마루 앱 — 프로젝트 개요 (Expo React Native)
- App.jsx — 라우팅 구조 & 실식 인증 & SSE 연결
- axiosInstance.js — axios 인터셉터 기반 JWT 인증 통신 관리

**Portfolio:** ✅✅ (SSE, Toss payment, RN WebView, Expo — impressive range)

---

### 6. SPRING BOOT (smartfarm project)
**ID:** `3439f0d4-...-80d2`
**Purpose:** Spring Boot backend code docs — main smartfarm/farm-tech project
**Pages:** 8
- NotificationController.java — SSE 실시간 알림 & FCM 푸시
- SensorService.java — IoT 센서 데이터 & DB Fallback 지원
- PaymentService.java — SELECT FOR UPDATE & Toss 결제 정합성
- ReviewController.java — @AuthenticationPrincipal 소유권 검증
- OrderController.java — 주문 생성 / 취소 / 확정 API
- PaymentController.java — 결제 승인 및 취소 API
- SseEmitterService.java — SSE 기반 실시간 알림 연결 관리
- SecurityConfig.java — Spring Security 인증/인가 설정

**Note:** SecurityConfig.java duplicated with MEMBER DB
**Portfolio:** ✅✅ (SSE, Toss결제, SELECT FOR UPDATE — real-world patterns)

---

### 7. RASPBERRY PI
**Purpose:** Raspberry Pi backend Python server
**Pages:** 1
- api_server.py

**Portfolio:** ✅ (lightweight)

---

### 8. SENSOR
**Purpose:** Sensor domain code docs
**Pages:** 2
- SensorController.java — 센서 데이터 조회 API
- SensorService.java + SensorMapper.java — 센서 데이터 조회 서비스

**Portfolio:** ✅

---

### 9. PRODUCT
**Purpose:** Product domain code docs
**Pages:** 2
- ProductController.java — 상품 CRUD & S3 업로드 API
- ProductService.java

**Portfolio:** ✅ (S3 upload is notable)

---

### 10. ACTUATOR
**Purpose:** Actuator (IoT device control) code docs
**Pages:** 2
- ActuatorController.java — 액추에이터 원격 제어 API
- ActuatorService.java — 라즈베리파이 액츄에이터 원격 제어

**Portfolio:** ✅ (IoT remote control)

---

### 11. REVIEW
**Purpose:** Review domain code docs
**Pages:** 4
- ReviewMapper.java — 리뷰 데이터 MyBatis 인터페이스
- ReviewService.java — 리뷰 CRUD & 소유권 검증
- ReviewReplyService.java — 리뷰 답변 upsert & SSE 알림 연동
- GeminiReviewService.java — AI 리뷰 자동 분류 & 답글 생성

**Portfolio:** ✅✅ (Gemini AI integration is standout)

---

### 12. ! common
**Purpose:** Shared/common components
**Pages:** 1
- TokenRemainButton.jsx — AccessToken 남은 시간 표시 및 연장 기능

**Archive candidate:** Low standalone value; merge into REACT or APP
**Portfolio:** 🔶 (minor)

---

### 13. 정리 (Spring Boot theory notes)
**Purpose:** Spring Boot learning notes / theory summaries
**Pages:** 5
- ⚙ gradlew 스크립트 구조와 사용법
- 🔍 Spring Security + JWT 기반 인증 기능 정리
- 📘 JPA(Java Persistence API)란?
- 🔍 JPA vs MyBatis 비교 정리
- 🤷‍♂️ 트랜잭션에 대해서

**Archive candidate:** Study notes — not directly portfolio-useful
**Portfolio:** 🔶 (reference only)

---

### 14. APP
**Purpose:** React web app component documentation
**Pages:** 12
- BMJUA폰트설정.css — 폰트 스타일 글로벌 적용
- WebItemDetail.jsx — 상품 상세 정보 페이지
- WebHeader.jsx — 웹 헤더 컴포넌트
- UserForm.jsx — 사용자 등록 폼
- UserLogin.jsx — 로그인 컴포넌트
- QnA.jsx — 질문 등록 컴포넌트
- FarmdasLayout.jsx — Farmdas 레이아웃
- Cart.jsx — 장바구니 컴포넌트
- App.jsx — 전체 라우팅 및 인증 처리
- index.js — 리액트 앱 진입점
- ⚙️ 프로젝트 개발 환경 설정 정리
- .env 설정 파일 정리

**Portfolio:** ✅ (full React app structure)

---

### 15. WEB_COMPONENTS
**Purpose:** RN app screen/folder structure index
**Pages:** 4
- 📁 main_home
- 📁 my_page
- 📁 cate_detail
- 📁 search

**Archive candidate:** Just folder labels, no content
**Portfolio:** ❌ (structural only)

---

### 16. AUTH / MAIN / SALES
**Purpose:** Admin page React components
**Pages:** 8
- SalesQuestions.jsx — 문의 글 목록
- SalesManage.jsx — 관리자 탭 페이지
- Login.jsx — 관리자 로그인
- SalesQnADetail.jsx — 문의 상세 내역
- OrdersInfo.jsx — 주문 내역 관리
- SalesInfo.jsx — 일별 매출 대시보드
- ItemList.jsx — 쇼핑몰 상품관련
- MembersInfo.jsx — 회원 목록

**Portfolio:** ✅ (admin dashboard with sales analytics)

---

### 17. STOCK
**Purpose:** IoT admin dashboard + sensor visualization components
**Pages:** 12
- AdminMain.jsx — 관리자 메인
- WeatherCard.js — 날씨 오픈 API 사용
- LiveStockInfo.jsx — stock 대시보드
- LiveStockTemperature.jsx — 실시간 온도 선형 그래프
- LiveStockHumidity.jsx — 실시간 온도 링형 그래프
- TemperatureCard.jsx — 온도에 따른 상태 카드
- HumidityCard.jsx — 습도에 따른 상태 카드
- Header.jsx — 관리자 페이지 상단
- AdminSideMenu.jsx — 관리자페이지 사이드
- StatusCard.jsx — 공용 상태 카드
- 📁 관리자 메인 페이지 및 세부 기능 컴포넌트 구성
- 📌 관리자 페이지 생성 및 온도 상세 페이지/질의 응답 페이지 생성

**Portfolio:** ✅✅ (IoT sensor visualization, real-time graphs)

---

### 18. 참고 내용
**Purpose:** Reference materials and concept explanations
**Pages:** 10
- React .env — API Key를 숨기지 못하는 이유
- API 개념 정리
- canvas란?
- 모바일 앱(React Native) 토큰 저장 방식
- 웹 보안 개념 XSS, CSRF, CSP
- 스프링시큐리티 + JWT
- 센서 제어 기능 소개 (React Native 앱)
- Redux란?
- 비밀번호 변경 흐름
- SMS 인증 기능 흐름 설명

**Portfolio:** ❌ (reference/study notes)
**Archive:** Low priority — keep for personal reference

---

### 19. 고민 & 문제 해결
**Purpose:** Problem-solving journal — design decisions and debugging
**Pages:** 14 (representative titles)
- 로그인 상태일 때만 마이페이지를 사용하려면 백? 프론트 어디서 해야할까?
- 문의 내역 어찌 만드냐고오!!!! 설계 어떻게 하냐고!!!!
- 검색을 했을 때 새로운 페이지가 필요한가?
- 모든 요청마다 인증 헤더 중복 작성 무슨 방법이 없을까?
- 앱에서 대시보드를 구성할 때 뭘 사용할까?
- react-native 할 때 뜨는 오류 메세지
- 오픈 API를 사용했을 때 개인 key는 어디에 둬야 안전할까?
- 비밀번호 변경 흐름 고민
- (+ 6 more)

**Portfolio:** 🔶 (shows thinking process — could excerpt for blog/README)
**Archive:** Keep — rich problem-solving log

---

### 20. REACT-NATIVE
**Purpose:** React Native project folder structure index
**Pages:** 6
- constants, contexts, app, components, redux, apis

**Archive candidate:** Folder labels only, no code content
**Portfolio:** ❌

---

### 21. SPRING BOOT (older / different project)
**ID:** `5ba9f0d4-...-831a`
**Purpose:** Spring Boot folder structure (different from #6)
**Pages:** 7
- 📁 user, 📁 jwt, 📁 app, 📁 shop, 📁 admin, 📁 config
- ⚙ 설정 및 사용된 코드 정리

**Note:** Different project from SPRING BOOT #6 (no IoT/sensor content)
**Portfolio:** 🔶 (minimal)

---

### 22. RUDEX
**Purpose:** Redux learning/usage notes
**Pages:** 1
- 🟪 RUDEX 사용기..

**Archive candidate:** Single note, superseded by newer Redux knowledge
**Portfolio:** ❌

---

### 23. RASPBERRY
**Purpose:** Raspberry Pi Python sensor scripts documentation
**Pages:** 4
- sensor_control.py — 환경 모니터링 시스템
- dht_led_monitor.py — DHT22 온습도 모니터링 및 온도 경고 LED 제어
- fan_control.py — 팬 제어
- motion_sensor.py — PIR 센서 및 LED, 클랙슨 제어

**Portfolio:** ✅ (IoT hardware interaction)

---

### 24. APIS
**Purpose:** Frontend API utility code
**Pages:** 2
- TokenUtils.js — 서버에서 받아오는 토큰 설정
- CRUD.js — axios 분리

**Portfolio:** 🔶

---

### 25. CONSTANTS
**Purpose:** Frontend constants/config
**Pages:** 1
- WeatherConfig.js — 코드 리뷰 및 설명

**Portfolio:** ❌ (minor)

---

### 26. 📁 Service / Repository / Mapper / Entity / DTO / Controller (×3 sets)
**IDs:** ~21 databases total (plain, (1), (2) variants)
**Purpose:** Spring Boot code docs split by team member layer — each member documented their own Service, Controller, etc.
**Example content (📁 Service):**
- CategoryService, CategoryServiceImpl, ItemService, ItemServiceImpl
- SmsService, AdminService, AdminServiceImpl, AnswerService, AnswerServiceImpl, EnvironmentService

**Example content (📁 Controller):**
- CategoryController, AnswerController, ItemController, AdminController

**Example content (📁 Entity):**
- AnswerEntity, ItemInfoEntity, EnvironmentEntity, CategoryInfoEntity

**Duplicates:** Sets (1) and (2) overlap significantly with base set — different team members, similar code layers
**Archive:** Sets (1) and (2) can likely be consolidated
**Portfolio:** ✅ (as a group — shows full MVC layered architecture)

---

### 27. Unnamed databases (empty title) ×4
**IDs:** `4639f0d4`, `c1c9f0d4`, `0cf9f0d4`, `4cb9f0d4`
**Pages:** All 0
**Archive:** ✅ (delete — no content, no name)

---

## Duplicate / Redundant Analysis

| Issue | Databases | Recommendation |
|-------|-----------|----------------|
| API 명세서 (1) identical ×3 | 3 DBs | Archive 2, keep 1 |
| SecurityConfig.java in both MEMBER and SPRING BOOT | 2 DBs | Cross-reference only |
| SPRING BOOT — 2 different projects same name | 2 DBs | Rename to distinguish |
| 📁 layers ×3 sets (plain/(1)/(2)) | ~21 DBs | Consolidate or label by member |
| Unnamed empty DBs ×4 | 4 DBs | Delete |
| etc (empty) | 1 DB | Delete |
| WEB_COMPONENTS / REACT-NATIVE (folder labels only) | 2 DBs | Archive or merge into parent |

---

## Pages Worth Archiving

- All 4 unnamed empty databases
- `etc` (empty)
- 2 of 3 `API 명세서 (1)` copies (identical content)
- `RUDEX` (1 page, superseded note)
- `WEB_COMPONENTS` (folder labels only)
- `REACT-NATIVE` (folder labels only)

---

## Pages Worth Keeping for Portfolio

| Database | Why |
|----------|-----|
| REACT | SSE, Toss payment WebView, Expo RN, JWT auth |
| SPRING BOOT (smartfarm) | SSE, SELECT FOR UPDATE, FCM push, IoT |
| REVIEW | Gemini AI integration — standout feature |
| ACTUATOR | IoT remote device control |
| RASPBERRY | Hardware sensor Python scripts |
| STOCK | Real-time IoT sensor visualization |
| API 명세서 (keep 1) | Clean REST API documentation |
| MEMBER | JWT/Spring Security full stack |
| AUTH / MAIN / SALES | Admin dashboard with sales analytics |
| 📁 Controller/Service/Entity (base set) | Full MVC layered architecture |
