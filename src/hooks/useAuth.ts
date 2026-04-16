/**
 * useAuth 훅
 *
 * 컴포넌트가 로그인 상태를 쉽게 읽을 수 있도록
 * authStore에서 필요한 값만 꺼내 반환하는 커스텀 훅입니다.
 *
 * 사용 예시:
 *   const { isLoggedIn, isReady, token } = useAuth();
 *   if (!isReady) return null;          // 토큰 복원 전이면 아직 아무것도 렌더링 X
 *   if (!isLoggedIn) return <Redirect href="/auth/login" />;
 */

import useAuthStore from '@/src/store/authStore';

/**
 * 로그인 상태 확인 훅
 *
 * @returns isLoggedIn - token이 null이 아니면 true (로그인 상태)
 * @returns isReady    - 앱 시작 시 토큰 복원이 완료되었는지 여부
 * @returns token      - 현재 액세스 토큰 (없으면 null)
 */
const useAuth = () => {
  // authStore에서 필요한 3가지 값만 선택적으로 구독
  // — 이렇게 하면 다른 상태(예: cartCount)가 바뀌어도 이 훅을 쓰는 컴포넌트가 불필요하게 리렌더링되지 않습니다
  const token = useAuthStore((state) => state.token);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  return {
    /** token이 null이 아니면 로그인된 상태 */
    isLoggedIn: token !== null,
    /** 앱 시작 시 SecureStore에서 토큰 복원이 완료되었는지 여부 */
    isReady: isAuthReady,
    /** 현재 액세스 토큰 값 (없으면 null) */
    token,
  };
};

export default useAuth;
