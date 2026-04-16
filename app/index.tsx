/**
 * 앱 진입점 (app/index.tsx)
 *
 * 로그인 상태에 따라 올바른 화면으로 리다이렉트합니다.
 * 이 컴포넌트 자체는 UI를 렌더링하지 않고, 오직 분기 역할만 합니다.
 *
 * 분기 로직:
 *   1. isAuthReady가 false → null 반환 (스플래시가 덮고 있으므로 대기)
 *   2. token 있음 (로그인 상태) → 홈 탭으로 이동
 *   3. token 없음 (비로그인) → 로그인 페이지로 이동
 */

import React from 'react';
import { Redirect } from 'expo-router';
import useAuth from '@/src/hooks/useAuth';

/**
 * 진입점 라우트 컴포넌트
 * 로그인 여부에 따라 홈 또는 로그인 페이지로 리다이렉트합니다.
 */
const IndexScreen = (): React.JSX.Element | null => {
  // useAuth 훅에서 로그인 상태를 가져옵니다
  const { isLoggedIn, isReady, token } = useAuth();

  // ── 1) 토큰 복원 전 ───────────────────────────
  // isAuthReady가 false이면 아직 SecureStore 복원 중입니다.
  // null을 반환해서 _layout.tsx의 스플래시 화면이 계속 덮도록 합니다.
  if (!isReady) return null;

  // ── 2) 로그인 상태 ────────────────────────────
  // token이 있으면 홈 탭(상품 목록)으로 이동합니다.
  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }

  // ── 3) 비로그인 상태 ──────────────────────────
  // token이 없으면 로그인 페이지로 이동합니다.
  return <Redirect href="/auth/login" />;
};

export default IndexScreen;
