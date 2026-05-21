# Notion Migration Progress
Updated: 2026-05-19 | Status: Archive — converted to full-page DB (inline → top-level) | Backend formatting: COMPLETE | Web Frontend formatting: COMPLETE | App Frontend formatting: COMPLETE | Raspberry Pi formatting: COMPLETE

---

## Technical Docs DB

**DB ID:** `3439f0d4-3ffb-80eb-a6a3-000b2727404d`
**URL:** https://www.notion.so/3439f0d43ffb801aa25bd84f32595dc7

**Method:** Renamed MEMBER → "Technical Docs", then moved all pages into it.

### Pages Moved (101 total)

| Source DB | Pages |
|-----------|-------|
| MEMBER (original, now renamed) | 5 |
| REACT | 7 |
| SPRING BOOT (smartfarm `80d2`) | 8 |
| SENSOR | 2 |
| ACTUATOR | 2 |
| PRODUCT | 2 |
| REVIEW | 4 |
| RASPBERRY PI | 1 |
| RASPBERRY (merged) | 4 |
| APP | 12 |
| STOCK | 12 |
| AUTH / MAIN / SALES | 8 |
| APIS | 2 |
| ! common | 1 |
| CONSTANTS | 1 |
| 📁Controller (base set) | 4 |
| 📁Service (base set) | 10 |
| 📁Repository (base set) | 4 |
| 📁Mapper (base set) | 1 |
| 📁Entity (base set) | 4 |
| 📁DTO (base set) | 7 |
| **TOTAL** | **101** |

---

## Duplicate Pages in Technical Docs (action needed)

| Page | Source | Action |
|------|--------|--------|
| SecurityConfig.java (MEMBER version) | `3439f0d4-3ffb-8154-8c28-c7fec4bd9f7a` | Archive — keep SPRING BOOT version (`3449f0d4-3ffb-8188`) |
| SensorService.java (SENSOR version) | `3449f0d4-3ffb-816c-9028-f5acb73f13c8` | Keep or link — different content from SPRING BOOT version |

---

## API Specification DB

**DB ID (new, full-page):** `3659f0d4-3ffb-819c-b145-f15cfc3fba1a`
**Data Source ID:** `3659f0d4-3ffb-81ec-aca5-000b6e3972e5`
**URL:** https://www.notion.so/3659f0d43ffb819cb145f15cfc3fba1a
**Parent:** top-level page "팜테크(FarmTech) 프로젝트 작업 일지" (`3299f0d4`) — `is_inline: false`

**Old inline DB (now empty):** `34c9f0d4-3ffb-8189-8d1a-000b5ebaec1e` — safe to delete after verification

**Method:** Created new full-page DB via Notion REST API (v2022-06-28), moved all 32 pages from old inline DB.

### Pages (32 total)

| Source DB | Pages |
|-----------|-------|
| API 명세서 (1) copy #1 (original) | 14 |
| API 명세서 — Sensor | 2 |
| API 명세서 — Actuator | 9 |
| Technical Docs — Controller pages | 7 |
| **TOTAL** | **32** |

### Controller pages moved from Technical Docs (7)
NotificationController.java, ReviewController.java, OrderController.java, PaymentController.java, ProductController.java, ActuatorController.java, SensorController.java

### Actuator pages moved (9)
제어 모드 조회, 제어 모드 설정, LED 켜기, LED 끄기, 팬 켜기, 팬 끄기, 부저 켜기, 부저 끄기, 전체 상태 조회

### Sensor pages moved (2)
최신 센서 데이터 조회, 기간별 센서 이력 조회

---

## Troubleshooting DB

**DB ID (new, full-page):** `3659f0d4-3ffb-8105-ab9f-cf7ce7ab087c`
**Data Source ID:** `3659f0d4-3ffb-8111-9acf-000b2c6095a1`
**URL:** https://www.notion.so/3659f0d43ffb8105ab9fcf7ce7ab087c
**Parent:** top-level page "팜테크(FarmTech) 프로젝트 작업 일지" (`3299f0d4`) — `is_inline: false`

**Old inline DB (now empty):** `5559f0d4-3ffb-8209-a7fa-873ac4aaa71c` — safe to delete after verification

**Method:** Created new full-page DB via Notion REST API (v2022-06-28), moved all 31 pages from old inline DB.

### Pages (31 total)

| Source DB | Pages |
|-----------|-------|
| 고민 & 문제 해결 (original) | 14 |
| 참고 내용 | 11 |
| 정리 | 5 |
| Additional (undercounted in plan) | 1 |
| **TOTAL** | **31** |

---

## Archive DB

**DB ID (new, full-page):** `3659f0d4-3ffb-8189-b4f5-c9244c5913d2`
**Data Source ID:** `3659f0d4-3ffb-8119-941c-000b84d4e1eb`
**URL:** https://www.notion.so/3659f0d43ffb8189b4f5c9244c5913d2
**Parent:** top-level page "팜테크(FarmTech) 프로젝트 작업 일지" (`3299f0d4`) — `is_inline: false`

**Old inline DB (now empty):** `34c9f0d4-3ffb-81fe-9c11-000bb92ecc9d` — safe to delete after verification

**Method:** Created new full-page DB via Notion REST API (v2022-06-28), moved all 46 pages from old inline DB.

### Pages (46 total)

| Source DB | Pages |
|-----------|-------|
| API 명세서 (1) copy #2 (`34c9f0d4-3ffb-81f2`) | 14 |
| API 명세서 (1) copy #3 (`34c9f0d4-3ffb-81a5`) | 14 |
| RUDEX | 1 |
| WEB_COMPONENTS | 4 |
| REACT-NATIVE | 6 |
| SPRING BOOT older (`5ba9f0d4-3ffb-831a`) | 7 |
| **TOTAL** | **46** |

**Note:** SPRING BOOT older's 7 pages brought along 📁 sets (1), (2), and (3) as child inline DBs (Controller/Service/Repository/Mapper/Entity/DTO variants).

---

## Technical Docs — Category Classification

**Date:** 2026-05-19 | **Property added:** `Category` (Select)

**Options:** Backend · Web Frontend · App Frontend · Raspberry Pi

| Category | Count | Example files |
|----------|-------|---------------|
| Backend | 41 | SseEmitterService.java, PaymentService.java, GeminiReviewService.java, AdminController.java, AnswerDTO.java, EnvironmentEntity.java, … |
| Web Frontend | 43 | App.jsx, authStore.js, RequireAuth.jsx, LiveStockTemperature.jsx, SalesManage.jsx, SalesInfo.jsx, WeatherCard.js, … |
| App Frontend | 5 | notificationApi.ts, TossPaymentWebView.tsx, device-control.tsx, authStore.ts, 한우마루 앱 |
| Raspberry Pi | 5 | api_server.py, sensor_control.py, motion_sensor.py, dht_led_monitor.py, fan_control.py |
| **Total** | **94** | |

**Note:** Many emoji-only pages (📦 🧩 🗂️ etc.) from the archived 📁 sets (1)/(2) are Java Backend files — classified by actual file name, not emoji.

---

## Remaining Migration Tasks

| Step | Target DB | Status |
|------|-----------|--------|
| Technical Docs | ✅ DONE | 101 pages moved |
| API Specification | ✅ DONE | 25 pages (14 Member + 2 Sensor + 9 Actuator) |
| Troubleshooting | ✅ DONE | 30 pages (14 고민 + 11 참고 내용 + 5 정리) |
| Archive | ✅ DONE | 46 pages (API copies ×28 + RUDEX 1 + WEB_COMPONENTS 4 + REACT-NATIVE 6 + SPRING BOOT older 7) |

---

## Technical Docs — Formatting Status Audit

**Date:** 2026-05-19 | **Standard:** Summary / Problem / Implementation / Key Code / Result / Related Links

| Status | Count |
|--------|-------|
| Fully formatted (all 6 headings) | 94 |
| Partially formatted (1–5 headings) | 0 |
| Not formatted (0 headings) | 0 |
| **Total** | **94** |

**By Category:**

| Category | Total | Fully | Partially | Not |
|----------|-------|-------|-----------|-----|
| Backend | 41 | 41 | 0 | 0 |
| Web Frontend | 43 | 43 | 0 | 0 |
| App Frontend | 5 | 5 | 0 | 0 |
| Raspberry Pi | 5 | 5 | 0 | 0 |

**Heading conversion note:** `API-update-a-block` cannot update heading rich_text in-place. Workaround: archive Korean heading → re-insert English heading at same position using `after` anchor in `API-patch-block-children`.

**Raspberry Pi Batch 1 (pages 1–5) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 1 | api_server.py | 📌 전체 코드→Key Code, ✅ 정리→Result; 🔍 핵심 기능별 설명 deleted (dup); api_server.py 설명 h2·개선 포인트·✅느낌점·🔒 보안·⚡ 신규·프로세스·🔄 untouched | Summary, Problem, Implementation, Related Links |
| 2 | sensor_control.py | 요약→Summary (trade-off), 📌 전체 코드→Key Code, ✅ 정리→Result; 🔍 핵심 기능별 설명·🧪 개선 포인트 deleted (dups); numbered sections untouched | Problem, Implementation, Related Links |
| 3 | dht_led_monitor.py | 요약→Summary (trade-off), 📌 전체 코드→Key Code, ✅ 정리→Result; 🔍 핵심 기능별 설명·🧪 개선 포인트 deleted (dups); ✅ 느낀점·🔧 추가 정리 untouched | Problem, Implementation, Related Links |
| 4 | fan_control.py | 요약→Summary (trade-off), 📌 전체 코드→Key Code, ✅ 정리→Result; 🔍 핵심 기능별 설명·🧪 개선 포인트 deleted (dups); ✅ 느낀점 untouched | Problem, Implementation, Related Links |
| 5 | motion_sensor.py | 요약→Summary (trade-off), 📌 전체 코드→Key Code, ✅ 정리→Result; 🔍 핵심 기능별 설명·🧪 개선 포인트 deleted (dups); ✅느낀점 untouched | Problem, Implementation, Related Links |

**Backend Batch 4 (pages 31–41) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 31 | AnswerDTO | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 32 | AnswerEntity | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 33 | (문의 답변 컨트롤러) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 34 | CategoryDTO | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 35 | ItemInfoEntity | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 36 | EnvironmentEntity | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 37 | (상품 등록/조회 API) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 38 | (SMS 인증 요청 DTO) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 39 | CategoryInfoEntity | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 40 | AdminController | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 41 | ProductDTO.java | Summary, Key Code, Result | Problem, Implementation, Related Links |

**Backend Batch 3 (pages 21–30) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 21 | ItemDTO | Summary | Problem, Implementation, Key Code, Result, Related Links |
| 22 | SmsRequestDTO | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 23 | (🧩) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 24 | (🌿) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 25 | EnvironmentService | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 26 | ItemInfoRepository | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 27 | (📦) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 28 | (💬) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 29 | (🗂️) | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 30 | (📦) | Summary, Key Code, Result | Problem, Implementation, Related Links |

**Backend Batch 2 (pages 11–20) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 11 | ReviewMapper.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 12 | ReviewService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 13 | ReviewReplyService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 14 | GeminiReviewService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 15 | CategoryService | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 16 | CategoryServiceImpl | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 17 | AdminService.java | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 18 | AdminServiceImpl.java | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 19 | AnswerService.java | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 20 | CategoryInfoRepository.java | Summary, Key Code, Result | Problem, Implementation, Related Links |

**App Frontend Batch 1 (pages 1–5) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 1 | notificationApi.ts | already fully formatted | — |
| 2 | TossPaymentWebView.tsx | 개요→Summary (trade-off), 해결한 문제→Problem, 핵심 코드 이탈→Key Code; 핵심 코드 URL deleted (dup); 결제 흐름 untouched | Implementation, Result, Related Links |
| 3 | device-control.tsx | 개요→Summary (trade-off), 해결한 문제→Problem, 핵심 코드 hasLoaded→Key Code; 핵심 코드 useFocusEffect deleted (dup); source=LIVE untouched | Implementation, Result, Related Links |
| 4 | authStore.ts | 개요→Summary (trade-off), 해결한 문제→Problem, 핵심 코드 decodeRole→Key Code; setToken/restoreToken deleted (dups); 주요 상태 필드·SecureStore 이유 untouched | Implementation, Result, Related Links |
| 5 | 한우마루 앱 개요 | 개요→Summary (trade-off); 기술 스택·역할 기반 탭 구조·웹과의 주요 차이점·환경 변수 untouched | Problem, Implementation, Key Code, Result, Related Links |

**Web Frontend Batch 5 (pages 41–43) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 41 | 📌 TokenUtils.js | 📌 전체 코드→Key Code (trade-off, was first block), ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Related Links |
| 42 | axios HTTP wrapper | 📌 전체 코드→Key Code, ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Related Links |
| 43 | ☀️ WeatherConfig.js | 📌 전체 코드→Key Code, ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Related Links |

**Web Frontend Batch 4 (pages 31–40) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 31 | 📦 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted) | Summary, Problem, Implementation, Key Code, Related Links |
| 32 | 💧 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Key Code, Related Links |
| 33 | 📊 SalesInfo.jsx | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted) | Summary, Problem, Implementation, Related Links |
| 34 | ➡️ | 📌 전체 코드→Key Code (trade-off) | Summary, Problem, Implementation, Result, Related Links |
| 35 | 📦 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Key Code, Related Links |
| 36 | 🧭 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Key Code, Related Links |
| 37 | 📌 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted) | Summary, Problem, Implementation, Key Code, Related Links |
| 38 | 📦 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (2 dupes deleted); ✅ 느낀점 untouched | Summary, Problem, Implementation, Key Code, Related Links |
| 39 | 📁 관리자 메인 | none matched mapping (unmapped h2s left as-is) | All 6 headings |
| 40 | 📌 관리자 페이지 | no h2 found (only h3) | All 6 headings |

**Web Frontend Batch 3 (pages 21–30) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 21 | 📌 SalesQuestions.jsx | 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Summary, Problem, Implementation, Related Links |
| 22 | 📝 | 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Summary, Problem, Implementation, Related Links |
| 23 | 🧭 SalesManage.jsx | 📌 전체 코드→Key Code (trade-off, was first block); dupe deleted; ✅ 정리 incorrectly left untouched (agent error) | Summary, Problem, Implementation, Key Code, Result, Related Links |
| 24 | 📝 | 📌 전체 코드→Key Code (dupes deleted) | Summary, Problem, Implementation, Result, Related Links |
| 25 | 📝 | 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Summary, Problem, Implementation, Related Links |
| 26 | 📦 | 📌 전체 코드→Key Code (trade-off), ✅ 정리→Result (dupes deleted) | Summary, Problem, Implementation, Related Links |
| 27 | 🌡️ | none (headings didn't match mapping) | All 6 headings |
| 28 | 📌 | 🔍 핵심 기능별 설명→Key Code, ✅ 정리→Result (dupe deleted) | Summary, Problem, Implementation, Related Links |
| 29 | 💧 | none | All 6 headings |
| 30 | 🌡️ | ✅ 정리→Result | Summary, Problem, Implementation, Key Code, Related Links |

**Web Frontend Batch 2 (pages 11–20) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 11 | 🧑‍💻 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 12 | 🧑‍💻 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 13 | TokenRemainButton.jsx | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupe deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 14 | 🛒 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 15 | 🗂️ | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links |
| 16 | 🧱 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 17 | ⚙️ 프로젝트 개발 환경 설정 정리 | 요약→Summary (trade-off) | Problem, Implementation, Key Code, Result, Related Links |
| 18 | 🧾 | (none — only .env heading, not mapped) | Summary, Problem, Implementation, Key Code, Result, Related Links |
| 19 | 📱 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |
| 20 | 🛒 | 요약→Summary, 📌 전체 코드→Key Code, ✅ 정리→Result (dupes deleted) | Problem, Implementation, Related Links, Summary (trade-off) |

**Web Frontend Batch 1 (pages 1–10) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 1 | App.jsx (라우팅) | (empty page) | Summary, Problem, Implementation, Key Code, Result, Related Links |
| 2 | axiosInstance.js | Key Code, Result, Problem | Summary, Implementation, Related Links |
| 3 | authStore.js | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 4 | RequireAuth.jsx | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 5 | 🛒 | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 6 | 🎨 | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 7 | 📦 WebItemDetail.jsx | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 8 | 🧑‍💻 | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 9 | 🧑‍💻 | Summary, Key Code, Result | Problem, Implementation, Related Links |
| 10 | 🧑‍💻 | Summary, Key Code, Result | Problem, Implementation, Related Links |

**Backend Batch 1 (pages 1–10) — completed 2026-05-19:**

| # | Page | Korean→English converted | Added |
|---|------|--------------------------|-------|
| 1 | SensorService.java (IoT) | Key Code, Problem, Result | Summary, Implementation, Related Links |
| 2 | PaymentService.java | Key Code, Problem, Result | Summary, Implementation, Related Links |
| 3 | MemberService.java | (no blocks) | All 6 headings |
| 4 | ProductService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 5 | SseEmitterService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 6 | SecurityConfig.java (auth) | Key Code, Problem, Result | Summary, Implementation, Related Links |
| 7 | ActuatorService.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 8 | SensorService.java + SensorMapper.java | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 9 | JWT 인증 시스템 | Key Code, Result | Summary, Problem, Implementation, Related Links |
| 10 | SecurityConfig.java (filter chain) | Key Code, Result | Summary, Problem, Implementation, Related Links |

---

## Content Quality Repair — Batch 1 (pages 1–10) — 2026-05-19

| # | Page | Category | Issues Found | Action |
|---|------|----------|-------------|--------|
| 1 | notificationApi.ts | App Frontend | Good | SKIPPED |
| 2 | TossPaymentWebView.tsx | App Frontend | Summary/Implementation/Result empty at end; orphaned paragraph; typos in callout | REPAIRED: added Summary, Implementation, Result content |
| 3 | device-control.tsx | App Frontend | Summary/Implementation/Result empty at end | REPAIRED: added all 3 sections |
| 4 | authStore.ts | App Frontend | Summary/Implementation/Result empty at end | REPAIRED: added all 3 sections |
| 5 | 한우마루 앱 | App Frontend | All 6 standard sections empty at end; content under Korean h2s only | REPAIRED: added Summary, Problem, Implementation, Key Code, Result |
| 6 | SensorService.java | Backend | Summary/Implementation empty at end; orphaned bullets at top | REPAIRED: added Summary, Implementation |
| 7 | PaymentService.java | Backend | Summary/Implementation empty at end; orphaned bullets at top | REPAIRED: added Summary, Implementation |
| 8 | App.jsx | Web Frontend | Completely empty (6 empty headings only) | REPAIRED: wrote all sections from project context |
| 9 | MemberService.java | Backend | Completely empty (6 empty headings only) | REPAIRED: wrote all sections from project context |
| 10 | ProductService.java | Backend | Summary/Problem/Implementation empty at end | REPAIRED: added all 3 sections |

**Structural note:** Pages 2–10 still have section ordering issue — original content blocks sit above the 6 standard headings (which were appended at bottom in prior pass). Content is present under correct headings; visual order is non-standard but readable. Manual reorganization needed for perfect structure.

**Remaining typos (manual review needed):**
- TossPaymentWebView.tsx callout/numbered_list: "와부보"→외부, "스탕"→스킴, "뺄릭"→클릭, "켜백"→콜백

---

## Notes

- Page format standardization: 85/94 done. Backend: 41/41 COMPLETE. Web Frontend: 43/43 COMPLETE. Next: App Frontend (4 remain), Raspberry Pi (5 pages).
- `📁 Controller` (with space, parent `4569f0d4`) is a 3rd unnamed set — treat as Archive along with sets (1) and (2)
- Source DBs are now empty but still exist in Notion — can be deleted after verification
