/**
 * 루트 레이아웃 (_layout.tsx)
 *
 * Expo Router의 최상위 레이아웃입니다.
 * 앱이 시작될 때 가장 먼저 실행되며, 아래 역할을 담당합니다:
 *
 * 1. SplashScreen.preventAutoHideAsync() — 앱 준비 전까지 스플래시 화면 유지
 * 2. authStore.restoreToken()            — SecureStore에서 토큰 복원 (앱 재시작 후 로그인 유지)
 * 3. isAuthReady가 true가 되면 SplashScreen.hideAsync() — 스플래시 숨기기
 * 4. AppState 이벤트                     — 앱이 포그라운드로 돌아올 때 미읽은 알림 polling
 * 5. AlertModal, Toast                   — 전역 알림 UI를 Stack과 함께 렌더링
 */

import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '@/src/store/authStore';
import { getUnreadNotifications } from '@/src/api/notificationApi';
import AlertModal from '@/src/components/common/AlertModal';
import Toast from '@/src/components/common/Toast';

// ─────────────────────────────────────────────
// 스플래시 화면 자동 숨김 방지
// ─────────────────────────────────────────────
// 이 함수는 컴포넌트 밖에서 호출해야 앱 최초 실행 시 즉시 적용됩니다.
// (컴포넌트 안에서 호출하면 너무 늦어서 스플래시가 먼저 사라질 수 있음)
SplashScreen.preventAutoHideAsync();

/**
 * 루트 레이아웃 컴포넌트
 *
 * isAuthReady가 false이면 null을 반환합니다.
 * 이때 스플래시 화면이 앱 전체를 덮고 있으므로 사용자에게 빈 화면이 보이지 않습니다.
 */
const RootLayout = (): JSX.Element | null => {
  // authStore에서 필요한 상태와 액션을 가져옵니다
  const token = useAuthStore((state) => state.token);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const restoreToken = useAuthStore((state) => state.restoreToken);
  const setNotifications = useAuthStore((state) => state.setNotifications);

  // AppState 이전 값을 추적하기 위한 ref
  // (background → active 전환만 감지하고 싶기 때문)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ─────────────────────────────────────────────
  // 앱 시작 시 토큰 복원
  // ─────────────────────────────────────────────
  useEffect(() => {
    /**
     * SecureStore에 저장된 토큰을 메모리(Zustand)로 복원합니다.
     * restoreToken() 내부에서 완료 시 isAuthReady를 true로 설정합니다.
     */
    restoreToken();
  }, []); // 빈 배열 = 컴포넌트가 처음 마운트될 때 딱 한 번만 실행

  // ─────────────────────────────────────────────
  // isAuthReady 변경 감지 → 스플래시 숨기기
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (isAuthReady) {
      // 토큰 복원이 완료된 후에야 스플래시 화면을 숨깁니다
      SplashScreen.hideAsync();
    }
  }, [isAuthReady]); // isAuthReady가 false → true로 바뀔 때 실행

  // ─────────────────────────────────────────────
  // 포그라운드 복귀 감지 → 알림 polling
  // ─────────────────────────────────────────────
  useEffect(() => {
    /**
     * AppState 이벤트 핸들러
     * 앱 상태 변화(active / background / inactive)를 감지합니다.
     *
     * background → active: 앱이 포그라운드로 돌아온 경우
     * → 로그인 상태일 때만 미읽은 알림을 새로 가져옵니다.
     */
    const HandleAppStateChange = async (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;

      // 이전 상태가 background/inactive이고 현재 active가 되었을 때만 처리
      if (prevState !== 'active' && nextState === 'active') {
        // 로그인 상태(token 존재)일 때만 알림 조회
        if (token) {
          try {
            // 서버에서 미읽은 알림 목록 조회
            const notifications = await getUnreadNotifications();
            // 스토어에 저장 (알림 뱃지, 알림 목록 화면에 반영됨)
            setNotifications(notifications);
          } catch (e) {
            // 알림 조회 실패는 앱 동작에 치명적이지 않으므로 조용히 처리
            console.warn('[RootLayout] 알림 조회 실패:', e);
          }
        }
      }

      // 다음 비교를 위해 현재 상태를 ref에 저장
      appStateRef.current = nextState;
    };

    // AppState 이벤트 구독
    const subscription = AppState.addEventListener('change', HandleAppStateChange);

    // 클린업: 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지)
    return () => subscription.remove();
  }, [token]); // token이 바뀌면(로그인/로그아웃) 핸들러를 새로 등록

  // ─────────────────────────────────────────────
  // 토큰 복원 전이면 null 반환
  // ─────────────────────────────────────────────
  // SplashScreen이 화면을 덮고 있으므로 사용자에게 빈 화면이 보이지 않습니다.
  if (!isAuthReady) return null;

  // ─────────────────────────────────────────────
  // 레이아웃 렌더링
  // ─────────────────────────────────────────────
  return (
    <>
      {/* 페이지 네비게이션 스택 */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* 전역 알림 모달 — 앱 어디서든 showAlert()로 띄울 수 있습니다 */}
      <AlertModal />

      {/* 전역 토스트 메시지 — 앱 어디서든 showToast()로 띄울 수 있습니다 */}
      <Toast />
    </>
  );
};

export default RootLayout;
