/**
 * 한우마루 앱 공통 색상 상수
 *
 * 웹 프로젝트 CSS에서 실제 사용 중인 색상을 그대로 옮겼습니다.
 * 컴포넌트에서 직접 색상 코드를 쓰지 말고 여기서 가져다 쓰세요.
 * 나중에 색상을 바꿔야 할 때 이 파일 하나만 수정하면 됩니다.
 *
 * 사용 예시:
 *   import { Colors } from '@/src/constants/colors';
 *   style={{ color: Colors.primary }}
 *   className="text-[#e63946]"  ← Tailwind는 직접 값 쓰는 것보다 아래 방식 권장
 */

export const Colors = {

  // ── 브랜드 컬러 ──────────────────────────────────────
  /** 한우마루 메인 레드 — 버튼, 뱃지, 강조 요소 */
  primary: '#e63946',
  /** 메인 레드 hover 시 */
  primaryDark: '#c00',

  // ── 텍스트 ───────────────────────────────────────────
  /** 제목, 본문 메인 텍스트 */
  textPrimary: '#1a1a1a',
  /** 부제목, 라벨 */
  textSecondary: '#555',
  /** 플레이스홀더, 비활성 텍스트 */
  textMuted: '#999',
  /** 힌트, 보조 설명 */
  textLight: '#aaa',

  // ── 배경 ─────────────────────────────────────────────
  /** 카드, 모달 배경 */
  bgWhite: '#ffffff',
  /** 페이지 기본 배경 */
  bgDefault: '#f9f9f9',
  /** 입력창, 섹션 구분 배경 */
  bgSurface: '#f4f4f4',
  /** 탭바, 헤더 배경 */
  bgLight: '#f0f0f0',

  // ── 테두리 ───────────────────────────────────────────
  /** 기본 구분선, 테두리 */
  border: '#ddd',
  /** 강조 테두리 */
  borderStrong: '#ccc',

  // ── 상태 컬러 ────────────────────────────────────────
  /** 성공 — 재고 안정, 완료 상태 */
  success: '#4caf50',
  successDark: '#16a34a',

  /** 경고 — 재고 주의, 별점 */
  warning: '#ff9800',
  /** 별점 색상 */
  star: '#f5a623',

  /** 에러 — 유효성 오류, 위험 재고 */
  error: '#e53935',

  // ── 주문 상태 배지 컬러 ──────────────────────────────
  /** 결제완료(PAID) */
  statusPaid: '#2563eb',
  /** 배송중(SHIPPING) */
  statusShipping: '#ff9800',
  /** 배송완료(SHIPPED) */
  statusShipped: '#4caf50',
  /** 구매확정(DONE) */
  statusDone: '#16a34a',
  /** 환불/취소(REFUNDED) */
  statusRefunded: '#999',

  // ── 기타 ─────────────────────────────────────────────
  /** 완전 투명 */
  transparent: 'transparent',
  /** 딤 처리 오버레이 */
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

/**
 * typeof Colors 에서 값 타입만 추출
 * 함수 파라미터에 색상 타입을 지정할 때 사용
 *
 * 사용 예시:
 *   function MyComp({ color }: { color: ColorValue }) { ... }
 */
export type ColorValue = typeof Colors[keyof typeof Colors];