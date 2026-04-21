/**
 * 루트 레이아웃 (_layout.tsx)
 *
 * Expo Router의 최상위 레이아웃입니다.
 * 앱이 시작될 때 가장 먼저 실행되며, 아래 역할을 담당합니다:
 *
 * 1. SplashScreen.preventAutoHideAsync() — 앱 준비 전까지 스플래시 화면 유지
 * 2. authStore.restoreToken()            — SecureStore에서 토큰 복원 (앱 재시작 후 로그인 유지)
 * 3. isAuthReady가 true가 되면 SplashScreen.hideAsync() — 스플래시 숨기기
 * 4. SSE 연결                            — 로그인 상태일 때 실시간 알림 수신
 * 5. AppState 이벤트                     — 포그라운드 복귀 시 놓친 알림 polling으로 보완
 * 6. AlertModal, Toast                   — 전역 알림 UI를 Stack과 함께 렌더링
 */

import '@/src/polyfills'; // document 폴리필 - 반드시 첫 번째 import여야 합니다
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '@/src/store/authStore';
import {
  connectNotificationStream,
  getUnreadNotifications,
} from '@/src/api/notificationApi';
import AlertModal from '@/src/components/common/AlertModal';
import Toast from '@/src/components/common/Toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'

// global.css는 NativeWind가 Tailwind 유틸리티를 활성화하기 위해 반드시 필요합니다
import '../global.css'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
const RootLayout = () => {
  // authStore에서 필요한 상태와 액션을 가져옵니다
  const token = useAuthStore((state) => state.token);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const restoreToken = useAuthStore((state) => state.restoreToken);
  const setNotifications = useAuthStore((state) => state.setNotifications);
  const addNotification = useAuthStore((state) => state.addNotification);

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
  // SSE 실시간 알림 연결
  // ─────────────────────────────────────────────
  useEffect(() => {
    // 비로그인 상태면 SSE 연결하지 않음
    // 로그아웃 시 token이 null이 되면 기존 연결을 해제합니다
    if (!token) {
      setNotifications([]);
      return;
    }

    // 앱 시작(또는 로그인) 시 미읽은 알림 목록 먼저 복원
    // SSE가 연결되기 전에 놓친 알림이 있을 수 있으므로 먼저 조회합니다
    getUnreadNotifications()
      .then((data) => setNotifications(data))
      .catch((e) => console.warn('[RootLayout] 알림 초기 조회 실패:', e));

    // SSE 연결 시작
    // connectNotificationStream은 연결 해제 함수를 반환합니다
    const disconnect = connectNotificationStream(token, (notification) => {
      // 새 알림이 올 때마다 스토어에 추가 (알림 목록 맨 앞에 삽입)
      addNotification(notification);
    });

    // 클린업: token이 바뀌거나(로그아웃/재로그인) 컴포넌트 언마운트 시 SSE 연결 해제
    return disconnect;
  }, [token]); // token이 바뀔 때마다 SSE 재연결

  // ─────────────────────────────────────────────
  // 포그라운드 복귀 감지 → 놓친 알림 polling 보완
  // ─────────────────────────────────────────────
  useEffect(() => {
    /**
     * AppState 이벤트 핸들러
     * 앱 상태 변화(active / background / inactive)를 감지합니다.
     *
     * SSE는 앱이 백그라운드에 있는 동안 끊길 수 있습니다.
     * 포그라운드로 돌아왔을 때 polling으로 놓친 알림을 보완합니다.
     */
    const HandleAppStateChange = async (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;

      // 이전 상태가 background/inactive이고 현재 active가 되었을 때만 처리
      if (prevState !== 'active' && nextState === 'active') {
        // 로그인 상태(token 존재)일 때만 알림 조회
        if (token) {
          try {
            // 서버에서 미읽은 알림 목록 전체 재조회
            // (SSE가 끊겨 있는 동안 놓친 알림을 여기서 보완)
            const notifications = await getUnreadNotifications();
            setNotifications(notifications);
          } catch (e) {
            console.warn('[RootLayout] 포그라운드 복귀 알림 조회 실패:', e);
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
  }, [token]); // token이 바뀌면 핸들러를 새로 등록

  // ─────────────────────────────────────────────
  // 토큰 복원 전이면 null 반환
  // ─────────────────────────────────────────────
  // SplashScreen이 화면을 덮고 있으므로 사용자에게 빈 화면이 보이지 않습니다.
  if (!isAuthReady) return null;

  // ─────────────────────────────────────────────
  // 레이아웃 렌더링
  // ─────────────────────────────────────────────
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        {/**
         * StatusBar: 상단 상태바 스타일 전역 설정
         * style="auto" — 라이트/다크 모드 자동 전환
         * translucent={false} — edgeToEdgeEnabled: true 환경에서 상태바가
         * 콘텐츠 위에 떠있지 않도록 불투명 처리
         */}
        <StatusBar style="auto" translucent={false} />
        
        {/* 페이지 네비게이션 스택 */}
        <Stack screenOptions={{ headerShown: false }}>
          {/**
           * index를 첫 번째로 명시해야 앱 시작 시 초기 화면이 됩니다.
           * Stack.Screen의 첫 번째 항목이 초기 라우트로 인식되므로
           * modal보다 반드시 앞에 위치해야 합니다.
           */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
  
          {/* 상품 상세 - 홈에서 상품 클릭 시 이동 */}
          <Stack.Screen name='product/[id]' />
  
          {/* 주문/결제 플로우 - 장바구니에서 주문하기 클릭 시 이동 */}
          <Stack.Screen name='order/checkout' />
          <Stack.Screen name='order/payment' />
          <Stack.Screen name='order/complete' />
          
          {/* 알림 목록 - 추후 헤더 벨 아이콘에서 이동 */}
          <Stack.Screen name='notification' />
          
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
  
        {/* 전역 알림 모달 — 앱 어디서든 showAlert()로 띄울 수 있습니다 */}
        <AlertModal />
  
        {/* 전역 토스트 메시지 — 앱 어디서든 showToast()로 띄울 수 있습니다 */}
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
