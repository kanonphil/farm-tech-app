import useAuthStore from '@/src/store/authStore'
import { router } from 'expo-router'

/**
 * 로그인이 필요한 액션 실행 전 인증 여부를 확인하는 유틸 함수
 *
 * 컴포넌트가 아닌 이벤트 핸들러(버튼 클릭 등)에서 호출합니다.
 * 화면 전체를 막는 AuthGuard와 달리, 특정 동작에만 인증을 요구할 때 사용합니다.
 *
 * @param isLoggedIn  현재 로그인 여부 (useAuth().isLoggedIn 전달)
 * @param redirectTo  로그인 후 돌아올 경로 (선택)
 * @param message     로그인 필요 시 표시할 토스트 메시지 (기본값 제공)
 * @returns 로그인 상태면 true, 비로그인이면 false (호출부에서 동작 중단 여부 판단)
 *
 * 사용 예시:
 *   const handleAddCart = () => {
 *     if (!requireAuthAction({ isLoggedIn, redirectTo: '/product/1' })) return
 *     // 로그인 상태일 때만 실행
 *     addToCart(productId)
 *   }
 */

type RequireAuthActionParams = {
  /** 현재 로그인 여부 */
  isLoggedIn: boolean
  /** 로그인 후 돌아올 경로 */
  redirectTo?: string
  /** 비로그인 시 표시할 토스트 메시지 */
  message?: string
}

export default function requireAuthAction({
  isLoggedIn,
  redirectTo,
  message = '로그인이 필요한 서비스입니다.',
}: RequireAuthActionParams) {
  // 로그인 상태면 그대로 통과
  if (isLoggedIn) return true

  // 비로그인 시 토스트 메시지 표시
  const { showToast } = useAuthStore.getState()
  showToast(message)

  // replace 사용: 로그인 후 뒤로가기 시 차단된 페이지로 돌아오는 것을 방지
  if (redirectTo) {
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  } else {
    router.replace('/auth/login')
  }

  return false
}