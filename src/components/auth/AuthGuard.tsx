import useAuth from '@/src/hooks/useAuth'
import useAuthStore from '@/src/store/authStore'
import { router } from 'expo-router'
import React, { useEffect } from 'react'

/**
 * 회원 전용 화면을 감싸는 인증 가드 컴포넌트
 *
 * - 로그인 상태가 아니면 로그인 화면으로 이동
 * - 로그인 후 돌아올 경로를 redirect 파라미터로 전달 가능
 * - 인증 상태 확인 전 또는 비로그인 상태에서는 null 반환
 */

type AuthGuardProps = {
  children: React.ReactNode
  redirectTo?: string
  message?: string
}

export default function AuthGuard({
  children,
  redirectTo,
  message = '로그인이 필요한 서비스입니다.',
}: AuthGuardProps) {
  const { isReady, isLoggedIn } = useAuth()
  const showToast = useAuthStore((state) => state.showToast)

  useEffect(() => {
    if (!isReady) return

    if (!isLoggedIn) {
      showToast(message)

      if (redirectTo) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isReady, isLoggedIn, redirectTo, message, showToast])

  if (!isReady || !isLoggedIn) return null
  
  return <>{children}</>
}