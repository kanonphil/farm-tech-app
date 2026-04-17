/**
 * 마이페이지 하위 스택 레이아웃 (app/mypage/_layout.tsx)
 *
 * 마이페이지 내부 화면들(주문 내역, 리뷰 관리, 내 정보 수정)의
 * 공통 헤더 스타일을 정의합니다.
 *
 * - headerShown: true   — 마이페이지 하위 화면에서는 헤더를 표시합니다.
 * - 뒤로가기 버튼 색상을 브랜드 레드(#e63946)로 통일합니다.
 * - 헤더 배경은 흰색, 타이틀은 굵게 표시합니다.
 */

import React from 'react';
import { Stack } from 'expo-router';

/**
 * 마이페이지 스택 레이아웃 컴포넌트
 */
const MypageLayout = () => {
  return (
    <Stack
      screenOptions={{
        // 헤더 표시 (마이페이지 하위 화면에서는 뒤로가기가 필요)
        headerShown: true,

        // 뒤로가기 버튼 색상 — 브랜드 레드
        headerTintColor: '#e63946',

        // 헤더 타이틀 스타일
        headerTitleStyle: {
          fontWeight: 'bold',
        },

        // 헤더 배경색 — 흰색
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    />
  );
};

export default MypageLayout;
