import { useCallback, useState } from "react";
import { CartItem } from "../types";
import useAuthStore from "../store/authStore";
import { deleteCartItems, getCartItems, updateCartItemQty } from "../api/cartApi";

/**
 * 장바구니 상태 및 액션을 관리하는 커스텀 훅
 *
 * 이 훅이 하는 일:
 *  1. 서버에서 장바구니 목록을 가져옵니다.
 *  2. 수량 변경 / 선택 삭제 액션을 처리합니다.
 *  3. authStore의 cartCount를 동기화합니다. (탭 뱃지에 반영)
 *
 * 사용 예시:
 *   const { cartItems, isLoading, fetchCart, updateQty, deleteItems } = useCart()
 */
export default function useCart() {
  /** 장바구니 상품 목록 */
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  /** 로딩 여부 (스켈레톤 UI 표시용) */
  const [isLoading, setIsLoading] = useState(false)

  /** 에러 메시지 */
  const [error, setError] = useState<string | null>(null)

  // authStore에서 필요한 액션만 가져옴.
  const setCartCount = useAuthStore((state) => state.setCartCount)
  const showToast = useAuthStore((state) => state.showToast)

  // ─────────────────────────────────────────────
  // 장바구니 목록 조회
  // ─────────────────────────────────────────────

  /**
   * 서버에서 장바구니 목록을 가져옵니다.
   * cart.tsx에서 useFocusEffect로 감싸서 화면 진입 시마다 호출하세요.
   *
   * useCallback: fetchCart 함수를 메모이제이션합니다.
   * 의존성 배열([setCartCount])이 바뀌지 않는 한 함수가 재생성되지 않아
   * useFocusEffect 같은 훅에서 불필요한 재실행을 막을 수 있습니다.
   */
  const fetchCart = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await getCartItems()
      setCartItems(items)

      /**
       * cartCount를 items.length로 동기화합니다.
       * 이 값이 탭 바의 뱃지 숫자로 표시됩니다.
       * (authStore.cartCount → (tabs)/_layout.tsx tabBarBadge)
       */
      setCartCount(items.length)
    } catch (error) {
      console.error('[useCart] 장바구니 조회 실패:', error)
      setError('장바구니를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [setCartCount])

  // ─────────────────────────────────────────────
  // 수량 변경 (낙관적 업데이트)
  // ─────────────────────────────────────────────

  /**
   * 장바구니 상품 수량을 변경합니다.
   *
   * 낙관적 업데이트(Optimistic Update) 방식을 사용합니다:
   *  1. 서버 요청 전에 UI를 먼저 변경 → 사용자 입장에서 즉각 반응
   *  2. 서버 요청 실패 시 이전 상태로 롤백 → 데이터 정합성 유지
   *
   * 반대로 서버 응답 후 UI를 바꾸면 +/- 버튼 누를 때마다
   * 0.x초씩 딜레이가 생겨 UX가 나빠집니다.
   *
   * @param cartItemId 수량을 변경할 항목의 ID
   * @param qty        변경할 수량
   */
  const updateQty = useCallback(async (cartItemId: number, qty: number) => {
    // 롤백을 위해 현재 상태를 저장
    const prevItems = cartItems

    // 1단계: UI 먼저 업데이트 (낙관적 업데이트)
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, cartItemQty: qty }
          : item
      )
    )

    try {
      // 2단계: 서버에 실제 요청
      await updateCartItemQty({ cartItemId, cartItemQty: qty })
    } catch (error) {
      console.error('[useCart] 수량 변경 실패:', error);
      setCartItems(prevItems)
      showToast('수량 변경에 실패했습니다.')
    }
  }, [cartItems, showToast])

  // ─────────────────────────────────────────────
  // 선택 삭제
  // ─────────────────────────────────────────────

  /**
   * 선택된 상품들을 장바구니에서 삭제합니다.
   *
   * 삭제는 낙관적 업데이트 대신 서버 성공 후 UI 반영 방식을 사용합니다.
   * 삭제는 되돌리기 어려운 작업이라 서버 확인 후 반영하는 게 더 안전합니다.
   *
   * @param cartItemIds 삭제할 cartItemId 배열
   */
  const deleteItems = useCallback(async (cartItemIds: number[]) => {
    try {
      // 서버에 삭제 요청
      await deleteCartItems(cartItemIds)

      // 성공 후 해당 항목들을 로컬 상태에서 제거
      setCartItems((prev) =>
        prev.filter((item) => !cartItemIds.includes(item.cartItemId))
      )

      // 탭 뱃지 숫자 감소
      setCartCount((prev) => prev - cartItemIds.length)      

      showToast('선택한 상품을 삭제했습니다.')
    } catch (error) {
      console.error('[useCart] 선택 삭제 실패:', error);
      showToast('삭제에 실패했습니다.')
    }
  }, [setCartCount, showToast])

  // ─────────────────────────────────────────────
  // 반환값
  // ─────────────────────────────────────────────

  return {
    /** 장바구니 상품 목록 */
    cartItems,
    /** 로딩 중 여부 */
    isLoading,
    /** 에러 메시지 (null이면 정상) */
    error,
    /** 장바구니 목록 새로고침 */
    fetchCart,
    /** 수량 변경 */
    updateQty,
    /** 선택 삭제 */
    deleteItems,
  }
}