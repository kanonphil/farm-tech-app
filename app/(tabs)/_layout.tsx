/**
 * 탭 바 레이아웃 (app/(tabs)/_layout.tsx)
 *
 * 하단 탭 바의 구성과 스타일을 정의합니다.
 * Ionicons(@expo/vector-icons)를 사용해 아이콘을 표시합니다.
 *
 * 탭 구성:
 *   - home    : 홈(상품 목록) — house 아이콘
 *   - cart    : 장바구니     — cart 아이콘, 수량 뱃지 표시
 *   - mypage  : 마이페이지   — person 아이콘
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/src/store/authStore';

/**
 * 탭 바 레이아웃 컴포넌트
 */
const TabsLayout = () => {
  // 장바구니 수량 — 0보다 크면 탭 아이콘 위에 뱃지로 표시합니다
  const cartCount = useAuthStore((state) => state.cartCount);

  return (
    <Tabs
      screenOptions={{
        // 모든 탭 공통 헤더 숨김 (각 탭 내부에서 별도 헤더 관리)
        headerShown: false,

        // 활성 탭 아이콘 및 텍스트 색상 (브랜드 레드)
        tabBarActiveTintColor: '#e63946',

        // 비활성 탭 아이콘 및 텍스트 색상 (회색)
        tabBarInactiveTintColor: '#999',

        // 탭 바 배경 및 상단 구분선 스타일
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
      }}
    >

      {/* ── 홈 탭 ────────────────────────────── */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ focused, color, size }) => (
            // focused: 현재 탭이 선택된 상태이면 채워진 아이콘, 아니면 outline
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ── 장바구니 탭 ──────────────────────── */}
      <Tabs.Screen
        name="cart"
        options={{
          title: '장바구니',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size}
              color={color}
            />
          ),
          // cartCount가 0보다 크면 아이콘 위에 숫자 뱃지를 표시합니다.
          // undefined를 전달하면 뱃지가 사라집니다.
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />

      {/* ── 마이페이지 탭 ─────────────────────── */}
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
};

export default TabsLayout;
