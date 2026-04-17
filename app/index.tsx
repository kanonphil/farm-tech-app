/**
 * 앱 진입점 (app/index.tsx)
 * 
 * 공개 라우트 + 회원 전용 라우트 + 회원 전용 액션 가드
 * 
 * 공개 접근 허용
 *  - 홈
 *  - 상품 상세
 *  - 로그인 / 회원가입
 * 
 * 회원 전용
 *  - 장바구니 화면
 *  - 주문 / 결제
 *  - 마이페이지
 *  - 주문 내역
 *  - 리뷰 작성/관리
 *  - 알림 관련 상세 기능
 */

import React from 'react';
import { Redirect } from 'expo-router';
import useAuth from '@/src/hooks/useAuth';

/**
 * 진입점 라우트 컴포넌트
 */
const IndexScreen = () => {
  const { isReady } = useAuth();

  // ── 1)  ───────────────────────────
  // null을 반환해서 _layout.tsx의 스플래시 화면이 계속 덮도록 합니다.
  if (!isReady) return null;

  // ── 2)  ──────────────────────────
  // 홈으로 이동합니다.
  return <Redirect href="/(tabs)/home" />;
};

export default IndexScreen;
