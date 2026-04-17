/**
 * Toast 컴포넌트
 *
 * authStore의 toast 상태를 읽어서 화면 하단에 잠깐 표시되는 메시지 UI입니다.
 * - Animated.View로 페이드인(등장) / 페이드아웃(퇴장) 애니메이션을 구현합니다.
 * - 메시지가 표시된 후 3초 뒤 자동으로 closeToast()를 호출해 사라집니다.
 *
 * - app/_layout.tsx에서 한 번만 렌더링하면 앱 어디서든 showToast()로 띄울 수 있습니다.
 *
 * 사용 예시 (어느 컴포넌트에서든):
 *   const { showToast } = useAuthStore();
 *   showToast('장바구니에 담겼습니다.');
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import useAuthStore from '@/src/store/authStore';

/**
 * 하단 토스트 메시지 컴포넌트
 * StyleSheet 없이 NativeWind(Tailwind) className만 사용합니다.
 */
const Toast = () => {
  // authStore에서 토스트 상태와 닫기 액션을 가져옵니다
  const toast = useAuthStore((state) => state.toast);
  const closeToast = useAuthStore((state) => state.closeToast);

  // 애니메이션 값 (0 = 완전 투명, 1 = 완전 불투명)
  // useRef로 관리해서 리렌더링 시 값이 초기화되지 않게 합니다
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.show) {
      // ── 페이드인 ──────────────────────────────
      // 300ms 동안 투명도 0 → 1 (서서히 등장)
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true, // 네이티브 드라이버 사용 → 성능 향상
      }).start();

      // 3초 후 페이드아웃 시작
      const hideTimer = setTimeout(() => {
        // ── 페이드아웃 ────────────────────────────
        // 300ms 동안 투명도 1 → 0 (서서히 퇴장)
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // 애니메이션이 완전히 끝난 후 상태 초기화
          closeToast();
        });
      }, 3000); // 3000ms = 3초

      // 클린업: 컴포넌트 언마운트 또는 toast.show 변경 시 타이머 취소
      return () => clearTimeout(hideTimer);
    } else {
      // toast.show가 false가 되면 투명도를 즉시 0으로 초기화
      opacity.setValue(0);
    }
  }, [toast.show]); // toast.show가 바뀔 때만 이 effect 실행

  // 토스트가 꺼져 있으면 아무것도 렌더링하지 않습니다
  if (!toast.show) return null;

  return (
    // Animated.View: opacity 애니메이션을 적용할 수 있는 뷰
    // absolute + bottom: 화면 하단 중앙 고정
    <Animated.View
      style={{ opacity }} // Animated 값은 style prop으로 전달 (className 미지원)
      className="absolute bottom-10 left-8 right-8 items-center"
    >
      {/* 검정 반투명 배경의 토스트 메시지 박스 */}
      <Text
        className="rounded-xl bg-black/75 px-5 py-3 text-sm text-white"
        numberOfLines={2} // 최대 2줄까지만 표시
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
};

export default Toast;
