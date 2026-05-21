# Notion Migration Plan
Generated: 2026-05-19 | Goal: Gamma portfolio hyperlinking

---

## Target Structure

| # | New DB | Purpose |
|---|--------|---------|
| 1 | **Technical Docs** | Code implementation docs (per feature/layer) |
| 2 | **API Specification** | REST API endpoint reference |
| 3 | **Troubleshooting** | Problem-solving journal, theory notes, references |
| 4 | **Archive** | Duplicates, empty, obsolete content |

---

## Migration Map

### → Technical Docs DB

| Source DB | Pages | Action | Notes |
|-----------|-------|--------|-------|
| MEMBER | 5 | MOVE | JWT, Spring Security, Zustand |
| REACT | 7 | MOVE | SSE, Toss WebView, Expo RN |
| SPRING BOOT (smartfarm, `80d2`) | 8 | MOVE | Core project — SSE, FCM, Toss 결제 |
| SENSOR | 2 | MOVE | IoT sensor domain |
| ACTUATOR | 2 | MOVE | IoT remote control |
| PRODUCT | 2 | MOVE | S3 upload, CRUD |
| REVIEW | 4 | MOVE | Gemini AI integration — highlight |
| RASPBERRY PI | 1 | MOVE | Python API server |
| RASPBERRY | 4 | MERGE → RASPBERRY PI | Same domain, combine |
| APP | 12 | MOVE | React web app components |
| AUTH / MAIN / SALES | 8 | MOVE | Admin dashboard |
| STOCK | 12 | MOVE | IoT sensor visualization, real-time graphs |
| ! common | 1 | MERGE → REACT | TokenRemainButton — minor, fits REACT |
| APIS | 2 | MERGE → REACT | axios/token utils — frontend code |
| CONSTANTS | 1 | MERGE → REACT | WeatherConfig — frontend config |
| 📁 Controller/Service/Entity (base set, no suffix) | ~7 DBs | MOVE | Full MVC architecture — keep as-is |

---

### → API Specification DB

| Source DB | Pages | Action | Notes |
|-----------|-------|--------|-------|
| API 명세서 (1) — copy #1 (keep 1) | 14 | MOVE | Member API docs |
| API 명세서 — Sensor | 2 | MOVE | GET /sensors, /sensors/history |
| API 명세서 — Actuator | 9 | MOVE | Device control endpoints |

---

### → Troubleshooting DB

| Source DB | Pages | Action | Notes |
|-----------|-------|--------|-------|
| 고민 & 문제 해결 | 14 | MOVE | Rich problem-solving log — portfolio value |
| 참고 내용 | 10 | MOVE | Concepts and security references |
| 정리 | 5 | MOVE | Spring Boot theory notes |

---

### → Archive

| Source DB | Pages | Action | Reason |
|-----------|-------|--------|--------|
| API 명세서 (1) — copy #2 | 14 | ARCHIVE | Duplicate |
| API 명세서 (1) — copy #3 | 14 | ARCHIVE | Duplicate |
| Unnamed DBs ×4 | 0 each | ARCHIVE/DELETE | Empty, no name |
| etc | 0 | ARCHIVE/DELETE | Empty |
| RUDEX | 1 | ARCHIVE | Superseded single note |
| WEB_COMPONENTS | 4 | ARCHIVE | Folder labels only, no code |
| REACT-NATIVE | 6 | ARCHIVE | Folder labels only, no code |
| SPRING BOOT (older, `831a`) | 7 | ARCHIVE | Different project, low portfolio value |
| 📁 sets (1) and (2) | ~14 DBs | ARCHIVE | Overlap with base set, different team members |

---

## Page-Level Decisions

### Overlapping pages (do NOT duplicate)

| Page | Exists In | Resolution |
|------|-----------|------------|
| SecurityConfig.java | MEMBER + SPRING BOOT (smartfarm) | Keep in SPRING BOOT; add cross-reference note in MEMBER |
| SensorService.java | SENSOR + SPRING BOOT (smartfarm) | Keep in SPRING BOOT; remove from SENSOR or add link |
| authStore (Zustand) | MEMBER + REACT | Keep in REACT (frontend state); MEMBER entry → link only |

---

## Summary Counts

| Target | DBs consolidated | Pages moved |
|--------|-----------------|-------------|
| Technical Docs | ~20 sources | ~70 pages |
| API Specification | 3 sources | ~25 pages |
| Troubleshooting | 3 sources | ~29 pages |
| Archive | ~12 sources | ~55 pages |

---

## Execution Order (when ready)

1. Create 4 new DBs in Notion
2. Move API Specification content first (smallest, cleanest)
3. Move Troubleshooting content
4. Move Technical Docs content (largest — batch by domain)
5. Handle overlapping pages (SecurityConfig, SensorService, authStore)
6. Archive duplicates and empties last
7. Delete unnamed empty DBs after confirming

---

## Gamma Portfolio Hyperlink Notes

For linking from Gamma slides, prioritize these pages:

| Feature | Page | Target DB |
|---------|------|-----------|
| AI review | GeminiReviewService.java | Technical Docs |
| Real-time alerts | SseEmitterService.java, notificationApi.ts | Technical Docs |
| Payment | PaymentService.java, TossPaymentWebView.tsx | Technical Docs |
| IoT sensors | sensor_control.py, LiveStockTemperature.jsx | Technical Docs |
| Auth/JWT | JwtUtil, SecurityConfig.java, authStore.ts | Technical Docs |
| REST API | API 명세서 (Actuator, Sensor, Member) | API Specification |
| Debugging process | 고민 & 문제 해결 (selected entries) | Troubleshooting |
