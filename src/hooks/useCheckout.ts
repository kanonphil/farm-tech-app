import { useCallback, useState } from "react"
import { CartItem, CreateOrderRequest } from "../types"
import useAuthStore from "../store/authStore"
import { getCartItems } from "../api/cartApi"
import { createOrder } from "../api/orderApi"

// ─────────────────────────────────────────────
// 개발용 더미 데이터 (useCart.ts와 동일)
// 로그인 구현 완료 후 IS_DEV = false 로 변경
// ─────────────────────────────────────────────
const IS_DEV = true

const DUMMY_CART_ITEMS: CartItem[] = [
  {
    cartItemId: 1, cartId: 1, productId: 1, cartItemQty: 2,
    product: {
      productId: 1, categoryId: 1, productName: '1++ 한우 등심 200g',
      productPrice: 45000, productStock: 10, productDesc: '최상급 한우 등심입니다.',
      productStatus: 'ACTIVE', mainImgUrl: 'https://placehold.co/200x200/png',
      subImgUrls: [], detailImgUrl: '',
    },
  },
  {
    cartItemId: 2, cartId: 1, productId: 2, cartItemQty: 1,
    product: {
      productId: 2, categoryId: 1, productName: '한우 갈비살 500g',
      productPrice: 78000, productStock: 5, productDesc: '부드러운 한우 갈비살입니다.',
      productStatus: 'ACTIVE', mainImgUrl: 'https://placehold.co/200x200/png',
      subImgUrls: [], detailImgUrl: '',
    },
  },
]

/**
 * 결제/주문 로직을 관리하는 커스텀 훅
 *
 * 역할:
 *  1. cartItemIds를 받아 해당 아이템만 필터링해서 화면에 표시
 *  2. 주문 제출 시 백엔드 OrderRequestDTO 형식으로 변환 후 API 호출
 *  3. 성공 시 tossOrderId를 반환 → 화면에서 완료 화면으로 이동
 *
 * submitOrder가 tossOrderId를 반환하는 이유:
 *  - 네비게이션은 훅이 아닌 화면(checkout.tsx)이 담당하는 게 더 깔끔하기 때문
 *  - 훅은 "데이터/로직", 화면은 "UI/네비게이션" — 관심사 분리
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
   * 전체 장바구니를 가져온 뒤 cartItemIds에 해당하는 것만 필터링합니다.
   * checkout.tsx에서 useFocusEffect로 감싸 호출하세요.
   */
  const loadItems = useCallback(async () => {
    if (cartItemIds.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const allItems = IS_DEV ? DUMMY_CART_ITEMS : await getCartItems()

      /**
       * cartItemIds 배열에 포함된 아이템만 필터링
       * Set으로 변환하면 has() 조회가 O(1) → 대용량에서도 빠름
       */
      const idSet = new Set(cartItemIds)
      setCheckoutItems(allItems.filter((item) => idSet.has(item.cartItemId)))
    } catch (error) {
      setError('주문 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [cartItemIds])

  // ─────────────────────────────────────────────
  // 합계 금액
  // ─────────────────────────────────────────────

  /**
   * 선택된 아이템 합산 금액
   * checkoutItems가 바뀔 때마다 재계산됩니다.
   */
  const totalPrice = checkoutItems.reduce((sum, item) => sum + item.product.productPrice * item.cartItemQty, 0)

  // ─────────────────────────────────────────────
  // 주문 제출
  // ─────────────────────────────────────────────

  /**
   * 주문을 생성하고 tossOrderId를 반환합니다.
   *
   * CartItem → OrderItemRequest 변환 과정:
   *  - productId, qty, price, name : 그대로 매핑
   *  - imageSavedName : S3 전체 URL에서 파일명만 추출
   *    예) "https://s3.../products/abc.jpg" → "abc.jpg"
   *
   * @returns 성공 시 tossOrderId 문자열, 실패 시 null
   */
  const submitOrder = useCallback(async (): Promise<string | null> => {
    setIsSubmitting(true)

    try {
      // 개발 모드: 실제 API 호출 없이 더미 ID 반환
      if (IS_DEV) {
        await new Promise((r) => setTimeout(r, 800))  // 로딩 느낌용 딜레이
        return 'ORDER_DEV_HANUMARU_001'
      }

      // CartItem[] => OrderItemRequest[] 변환
      const orderItemDTOList = checkoutItems.map((item) => ({
        productId: item.productId,
        orderItemQty: item.cartItemQty,
        orderItemPrice: item.product.productPrice,
        productName: item.product.productName,
        // S3 URL 마지막 세그먼트 = 파일명
        imageSavedName: item.product.mainImgUrl.split('/').pop() ?? '',
      }))

      const request: CreateOrderRequest = {
        orderDTO: { orderTotalPrice: totalPrice },
        orderItemDTOList,
      }

      const response = await createOrder(request)
      return response.tossOrderId
    } catch (error) {
      showToast('주문에 실패했습니다. 다시 시도해주세요.')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [checkoutItems, totalPrice, showToast])

  // ─────────────────────────────────────────────
  // 반환값
  // ─────────────────────────────────────────────
    
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