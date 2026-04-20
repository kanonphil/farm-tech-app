/**
 * 장바구니 관련 API 모듈
 *
 * 웹의 product.js에서 장바구니 관련 함수만 추려서 작성했습니다.
 * 장바구니 조회, 상품 추가, 수량 변경, 선택 삭제, 전체 삭제
 */

import { axiosInstance } from './axiosInstance';
import { AddCartRequest, UpdateCartRequest, CartItem } from '@/src/types';

// ─────────────────────────────────────────────
// 조회
// ─────────────────────────────────────────────

/**
 * 장바구니 전체 조회
 * GET /carts/items
 *
 * ⚠️ 백엔드가 CartDTO 래퍼 없이 List<CartItemDTO>를 직접 반환합니다.
 * 따라서 반환 타입이 Cart가 아닌 CartItem[] 입니다.
 *
 * @returns 장바구니 상품 목록 (각 항목 안에 product 정보 중첩)
 */
export const getCartItems = async (): Promise<CartItem[]> => {
  const response = await axiosInstance.get<CartItem[]>('/carts/items');
  return response.data;
};

// ─────────────────────────────────────────────
// 추가
// ─────────────────────────────────────────────

/**
 * 장바구니에 상품 추가
 * POST /carts
 * 이미 담긴 상품이면 수량이 합산됩니다.
 * @param data { productId: 상품 ID, cnt: 담을 수량 }
 */
export const addCartItem = async (data: AddCartRequest): Promise<void> => {
  await axiosInstance.post('/carts', data);
};

// ─────────────────────────────────────────────
// 수정
// ─────────────────────────────────────────────

/**
 * 장바구니 상품 수량 변경
 * PUT /carts/cnt
 * @param data { cartId: 장바구니 항목 ID, cnt: 변경할 수량 }
 */
export const updateCartItemQty = async (
  data: UpdateCartRequest
): Promise<void> => {
  await axiosInstance.put('/carts/cnt', data);
};

// ─────────────────────────────────────────────
// 삭제
// ─────────────────────────────────────────────

/**
 * 장바구니 선택 상품 삭제
 * DELETE /carts/item
 * @param cartItemIds 삭제할 cartItemId 배열 (예: [1, 3, 5])
 *
 * DELETE 요청에 body를 담을 때는 axios의 { data: ... } 옵션을 사용합니다.
 * fetch나 다른 라이브러리와 달리 axios는 DELETE에 body를 이렇게 전달해야 합니다.
 */
export const deleteCartItems = async (cartItemIds: number[]): Promise<void> => {
  await axiosInstance.delete('/carts/item', { data: cartItemIds });
};

/**
 * 장바구니 전체 삭제
 * DELETE /carts/all
 * 결제 완료 후 장바구니를 비울 때 사용합니다.
 */
export const deleteAllCartItems = async (): Promise<void> => {
  await axiosInstance.delete('/carts/all');
};