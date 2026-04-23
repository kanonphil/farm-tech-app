/**
 * 앱 진입점 (app/index.tsx)
 * 
 * 토큰 복원 완료 후 role에 따라 첫 화면을 결정
 *  - MANAGER -> 대시보드 탭 (/(tabs)/dashboard)
 *  - 그 외 -> 홈 탭 (/(tabs)/home)
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
 * 
 * 매니저 전용
 *  - 대시보드 화면
 *  - 기기 제어 및 실시간 정보 화면
 *  - 현재 날씨 및 누적 데이터 그래프 화면
 */

import React from 'react';
import { Redirect } from 'expo-router';
import useAuth from '@/src/hooks/useAuth';

/**
 * 진입점 라우트 컴포넌트
 */
const IndexScreen = () => {
  const { isReady, role } = useAuth();

  // 토큰 복원이 완료될 때까지 null 반환
  // _layout.tsx의 스플래시 화면이 계속 덮도록 함.
  if (!isReady) return null;

  // role에 따라 첫 진입 탭 결정
  return <Redirect href={role === 'MANAGER' ? '/(tabs)/dashboard' : '/(tabs)/home'} />
}

export default IndexScreen;
