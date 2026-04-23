/**
 * 탭 바 레이아웃 (app/(tabs)/_layout.tsx)
 *
 * 로그인한 사용자의 role에 따라 표시되는 탭이 달라집니다.
 *
 * 일반 유저 (role !== 'MANAGER'):
 *   - home    : 홈(상품 목록)  — house 아이콘
 *   - cart    : 장바구니       — cart 아이콘, 수량 뱃지 표시
 *   - mypage  : 마이페이지     — person 아이콘
 *
 * 매니저 (role === 'MANAGER'):
 *   - dashboard      : 대시보드  — speedometer 아이콘
 *   - device-control : 기기제어  — hardware-chip 아이콘
 *   - data           : 데이터 확인 — bar-chart 아이콘
 *
 * Expo Router에서 href: null을 설정하면 탭 바에서 해당 탭이 숨겨집니다.
 * (라우트 자체는 존재하지만 탭 바에 노출되지 않습니다)
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
  const role = useAuthStore((state) => state.role)

  /** true면 매니저 탭을 표시하고, 일반 탭을 숨김 */
  const isManager = role === 'MANAGER'

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

      {/* ── 일반 유저 탭 (매니저면 숨김) ────────── */}
      {/* ── 홈 탭 ────────────────────────────── */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          // 매니저면 href: null -> 탭 바에서 숨김
          href: isManager ? null : undefined,
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
          href: isManager ? null : undefined,
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
          href: isManager ? null : undefined,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ── 매니저 탭 (일반 유저면 숨김) ─────────── */}

      <Tabs.Screen
        name="dashboard"
        options={{
          title: '대시보드',
          href: isManager ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'speedometer' : 'speedometer-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="device-control"
        options={{
          title: '기기제어',
          href: isManager ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'hardware-chip' : 'hardware-chip-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="data"
        options={{
          title: '데이터 확인',
          href: isManager ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
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
