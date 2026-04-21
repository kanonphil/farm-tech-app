import { useCallback, useState } from 'react'
import { CartItem, CreateOrderRequest } from '../types'
import useAuthStore from '../store/authStore'
import { getCartItems } from '../api/cartApi'
import { createOrder } from '../api/orderApi'

/**
 * 결제/주문 로직을 관리하는 커스텀 훅
 *
 * 역할:
 *  1. cartItemIds 를 받아 해당 아이템만 필터링해서 화면에 표시
 *  2. 주문 제출 시 OrderRequestDTO 형식으로 변환 후 API 호출
 *  3. 성공 시 tossOrderId 반환 → checkout.tsx 에서 결제 화면으로 이동
 *
 * @param cartItemIds 장바구니에서 선택된 cartItemId 배열
 */
export default function useCheckout(cartItemIds: number[]) {
  /** 결제 화면에 표시할 아이템 목록 */
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])

  /** 아이템 로딩 중 여부 */
  const [isLoading, setIsLoading] = useState(false)

  /** 에러 메시지 */
  const [error, setError] = useState<string | null>(null)

  /** 주문 제출 중 여부 (버튼 스피너) */
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = useAuthStore((state) => state.showToast)

  // ─────────────────────────────────────────────
  // 아이템 로드
  // ─────────────────────────────────────────────

  /**
   * 전체 장바구니를 가져온 뒤 cartItemIds 에 해당하는 것만 필터링합니다.
   * checkout.tsx 에서 useFocusEffect 로 감싸 호출하세요.
   */
  const loadItems = useCallback(async () => {
    if (cartItemIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const allItems = await getCartItems()
      const idSet = new Set(cartItemIds)
      setCheckoutItems(allItems.filter((item) => idSet.has(item.cartItemId)))
    } catch {
      setError('주문 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [cartItemIds])

  // ─────────────────────────────────────────────
  // 합계 금액
  // ─────────────────────────────────────────────

  const totalPrice = checkoutItems.reduce(
    (sum, item) => sum + item.product.productPrice * item.cartItemQty,
    0,
  )

  // ─────────────────────────────────────────────
  // 주문 제출
  // ─────────────────────────────────────────────

  /**
   * 주문을 생성하고 tossOrderId 를 반환합니다.
   *
   * 재고 부족 시 서버에서 400 에러와 함께 메시지를 내려주므로
   * 에러 메시지에 따라 안내 문구를 다르게 표시합니다.
   *
   * @returns 성공 시 tossOrderId 문자열, 실패 시 null
   */
  const submitOrder = useCallback(async (): Promise<string | null> => {
    setIsSubmitting(true)

    try {
      const orderItemDTOList = checkoutItems.map((item) => ({
        productId: item.productId,
        orderItemQty: item.cartItemQty,
        orderItemPrice: item.product.productPrice,
        productName: item.product.productName,
        imageSavedName: item.product.mainImgUrl.split('/').pop() ?? '',
      }))

      const request: CreateOrderRequest = {
        orderDTO: { orderTotalPrice: totalPrice },
        orderItemDTOList,
      }

      const response = await createOrder(request)
      return response.tossOrderId
    } catch (error: any) {
      const serverMessage: string = error?.response?.data?.message ?? ''
      if (serverMessage.includes('재고가 부족')) {
        showToast('재고가 부족한 상품이 있습니다. 수량을 확인해주세요.')
      } else {
        showToast('주문에 실패했습니다. 다시 시도해주세요.')
      }
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [checkoutItems, totalPrice, showToast])

  return {
    /** 결제 화면에 표시할 아이템 목록 */
    checkoutItems,
    /** 아이템 로딩 중 */
    isLoading,
    /** 에러 메시지 */
    error,
    /** 주문 제출 중 */
    isSubmitting,
    /** 선택 아이템 합산 금액 */
    totalPrice,
    /** 아이템 로드 함수 */
    loadItems,
    /** 주문 제출 함수 — 성공 시 tossOrderId 반환 */
    submitOrder,
  }
}