import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { router } from 'expo-router'

/**
 * 로그인 필수 페이지용 인증 가드 훅
 *
 * 사용법:
 *   페이지 컴포넌트 최상단에서 호출하면,
 *   비로그인 상태일 때 자동으로 로그인 화면으로 이동합니다.
 *
 * 주의:
 *   isAuthReady가 false(토큰 복원 중)인 동안은 redirect하지 않습니다.
 *   복원이 완료된 후에도 token이 없을 때만 redirect합니다.
 *
 * 반환값:
 *   isLoggedIn — 현재 로그인 상태 (렌더링 조건 분기용)
 *   isReady    — 토큰 복원 완료 여부 (로딩 스피너 표시 조건용)
 *
 * 사용 예시:
 *   export default function OrdersPage() {
 *     const { isLoggedIn, isReady } = useRequireAuth()
 *     if (!isReady) return <LoadingSpinner full />
 *     if (!isLoggedIn) return null  // redirect 처리 중
 *     return <View>...</View>
 *   }
 */
export default function useRequireAuth() {
  const token = useAuthStore((state) => state.token)
  const isAuthReady = useAuthStore((state) => state.isAuthReady)

  useEffect(() => {
    // 토큰 복원이 완료되었는데 로그인 상태가 아니면 로그인 화면으로 이동
    if (isAuthReady && !token) {
      router.replace('/auth/login')
    }
  }, [isAuthReady, token])
  
  return {
    // 로그인 여부
    isLoggedIn: !!token,
    // 토큰 복원 완료 여부
    isReady: isAuthReady,
  }
}