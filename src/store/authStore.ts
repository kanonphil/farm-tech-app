/**
 * 전역 인증 상태 관리 스토어 (Zustand)
 *
 * 웹 버전(authStore.js)과 구조는 동일하지만 앱 환경에 맞게 아래 두 가지가 다릅니다:
 *   1. 토큰 저장소: 웹은 쿠키 → 앱은 expo-secure-store (iOS Keychain / Android Keystore)
 *   2. 로그아웃 리다이렉트: 웹은 window.location.href → 앱은 expo-router의 router.replace()
 *
 * SecureStore를 쓰는 이유:
 *   - AsyncStorage는 암호화되지 않아 토큰 같은 민감한 정보 저장에 부적합
 *   - SecureStore는 OS 수준의 보안 저장소를 사용해 토큰을 안전하게 보관
 */

import { UserNotification } from "@/src/types";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

// ── SecureStore 키 ────────────────────────────────────
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";   // ← 추가

/**
 * JWT 토큰의 payload를 base64 디코딩해 role 클레임을 추출
 * jwt-decode 패키지 없이 Expo 내장 atob()를 사용
 * 
 * @param token - 액세스 토큰 (Bearer 제거된 순수 토큰 문자열)
 * @returns role 클레임 값 (예: "MANAGER", "USER") - 실패 시 null
 */
function decodeRole(token: string): string | null {
  try {
    // JWT는 header.payload.signature 세 부분으로 구성
    const base64Payload = token.split('.')[1]
    // URL-safe base64 -> 표준 base64 변환 후 디코딩
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))
    const role: string | undefined = decoded.role;
    if (!role) return null;
    return role.startsWith('ROLE_') ? role.slice(5) : role;
  } catch (error) {
    return null
  }
}

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** 알림 모달 상태 타입 */
interface AlertModal {
  show: boolean;
  message: string;
  /** 확인 버튼 클릭 후 실행할 콜백 함수 (없으면 null) */
  callback: (() => void) | null;
}

/** 토스트 메시지 상태 타입 */
interface Toast {
  show: boolean;
  message: string;
}

/** 스토어 전체 상태 + 액션 타입 */
interface AuthStore {
  // ── 상태(State) ──────────────────────────────
  /** 액세스 토큰 (메모리에만 보관, 앱 재시작 시 SecureStore에서 복원) */
  token: string | null;
  /** JWT에서 디코딩한 사용자 역할 (예: 'MANAGER', 'USER') */
  role: string | null;
  /** 자동로그인 30일 rolling을 위한 refresh token */
  refreshToken: string | null;
  /** 앱 시작 시 토큰 복원 완료 여부 — false이면 스플래시 유지 */
  isAuthReady: boolean
  /** 읽지 않은 알림 목록 */
  notifications: UserNotification[]
  /** 장바구니 상품 개수 (탭 뱃지에 표시) */
  cartCount: number
  /** 알림 모달 상태 */
  alertModal: AlertModal
  /** 토스트 메시지 상태 */
  toast: Toast

  // ── 액션(Action) ─────────────────────────────
  /**
   * 로그인 성공 시 토큰 저장
   * 메모리(Zustand)와 SecureStore 양쪽에 저장해
   * 앱을 완전히 종료했다 켜도 로그인 상태가 유지됩니다.
   */
  setToken: (token: string, refreshToken?: string) => Promise<void>;

  setRefreshToken: (token: string) => Promise<void>;

  /**
   * 로그아웃 시 토큰 삭제
   * 메모리와 SecureStore 양쪽에서 모두 제거합니다.
   */
  clearToken: () => Promise<void>;

  /**
   * 앱 시작 시 SecureStore에서 토큰을 꺼내 메모리에 복원
   * app/_layout.tsx의 useEffect에서 딱 한 번 호출합니다.
   */
  restoreToken: () => Promise<void>;

  /** 토큰 복원 완료 표시 — 스플래시 화면을 숨길 시점에 호출 */
  setAuthReady: () => void;

  // 장바구니 수량
  setCartCount: (countOrFn: number | ((prev: number) => number)) => void;

  // 알림 목록
  setNotifications: (notifications: UserNotification[]) => void;
  addNotification: (notification: UserNotification) => void;
  removeNotification: (notificationId: number) => void;

  // 알림 모달
  showAlert: (message: string, callback?: () => void) => void;
  closeAlert: () => void;

  // 토스트
  showToast: (message: string) => void;
  closeToast: () => void;
}

// ─────────────────────────────────────────────
// 스토어 생성
// ─────────────────────────────────────────────

const useAuthStore = create<AuthStore>((set) => ({
  // ── 초기 상태 ────────────────────────────────
  token: null,
  role: null,
  refreshToken: null,
  isAuthReady: false,
  notifications: [],
  cartCount: 0,
  alertModal: { show: false, message: "", callback: null },
  toast: { show: false, message: "" },

  // ── 토큰 액션 ────────────────────────────────

  setToken: async (token: string, refreshToken?: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // refresh token이 있을 때만 저장 (갱신 시 새 토큰으로 덮어씀)
    if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    // 2) Zustand 메모리에도 저장 + JWT에서 role 디코딩 (컴포넌트에서 즉시 사용)
    set({ token, role: decodeRole(token) });
  },

  // ── setRefreshToken (추가) ─────────────────
  setRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    set({ refreshToken: token });
  },

  clearToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    // role도 함께 초기화 (로그아웃 후 잔재 방지)
    set({ token: null, role: null, refreshToken: null, cartCount: 0, notifications: [] });
  },

  restoreToken: async () => {
    try {
      // 앱 재시작 시 SecureStore에서 두 토큰 모두 복원
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (savedToken) {
        // 토큰 복원 시 role도 함께 복원
        set({ 
          token: savedToken, 
          refreshToken: savedRefreshToken ?? null,
          role: decodeRole(savedToken) 
        });
      }
    } catch (e) {
      console.warn("[AuthStore] 토큰 복원 실패:", e);
    } finally {
      set({ isAuthReady: true });
    }
  },

  setAuthReady: () => set({ isAuthReady: true }),

  // ── 장바구니 ─────────────────────────────────

  setCartCount: (countOrFn) =>
    set((state) => ({
      cartCount:
        typeof countOrFn === "function"
          ? countOrFn(state.cartCount) // 함수면 이전 값 기반으로 계산 (예: prev => prev + 1)
          : countOrFn, // 숫자면 그대로 설정
    })),

  // ── 알림 목록 ────────────────────────────────

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      // 새 알림을 맨 앞에 추가 (최신순)
      notifications: [notification, ...state.notifications],
    })),

  removeNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.notificationId !== notificationId,
      ),
    })),

  // ── 알림 모달 ────────────────────────────────

  showAlert: (message, callback) =>
    set({ alertModal: { show: true, message, callback: callback ?? null } }),

  closeAlert: () =>
    set({ alertModal: { show: false, message: "", callback: null } }),

  // ── 토스트 ───────────────────────────────────

  showToast: (message) => set({ toast: { show: true, message } }),

  closeToast: () => set({ toast: { show: false, message: "" } }),
}));

export default useAuthStore;
