import { axiosInstance } from './axiosInstance';
import { Order, CreateOrderRequest, CreateOrderResponse } from '@/src/types';

/**
 * 주문 생성 API
 *
 * 흐름:
 *  1. 결제 화면에서 호출
 *  2. 서버가 주문을 DB에 저장하고 tossOrderId를 생성해서 반환
 *  3. 반환된 tossOrderId로 Toss 결제 위젯을 초기화 (추후 구현)
 *
 * POST /orders
 * @param request 주문 정보 (총액 + 주문 아이템 목록)
 * @returns 서버가 생성한 Toss 주문 ID
 */
export const createOrder = async (
  request: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const response = await axiosInstance.post<CreateOrderResponse>(
    '/orders',
    request
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 주문 조회
// ─────────────────────────────────────────────

/**
 * 최근 주문 정보 조회 (결제 화면 진입 시 사용)
 * GET /orders
 * 로그인한 회원의 가장 최근 주문 정보를 반환합니다.
 * @returns 주문 정보 (주문 상품 목록 포함)
 */
export const getLatestOrder = async (): Promise<Order> => {
  const response = await axiosInstance.get<Order>('/orders');
  return response.data;
};

/**
 * 내 주문 내역 조회
 * GET /orders/list?startDate=xxx&endDate=xxx
 * @param startDate 조회 시작일 (예: "2026-03-15")
 * @param endDate   조회 종료일 (예: "2026-04-14")
 * @returns 주문 목록 배열 (각 주문에 orderItemDTOList 포함)
 */
export const getOrderList = async (
  startDate: string,
  endDate: string
): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>('/orders/list', {
    params: { startDate, endDate },
  });
  return response.data;
};

// ─────────────────────────────────────────────
// 주문 상태 변경
// ─────────────────────────────────────────────

/**
 * 구매 확정
 * PATCH /orders/{orderId}/confirm
 * 배송완료(SHIPPED) 상태의 주문을 구매확정(DONE)으로 변경합니다.
 * 구매 확정 후에만 리뷰 작성이 가능합니다.
 * @param orderId 구매 확정할 주문 ID
 * @returns { orderId, status: 'DONE', confirmedAt }
 */
export const confirmOrder = async (
  orderId: number
): Promise<{ orderId: number; status: string; confirmedAt: string }> => {
  const response = await axiosInstance.patch<{
    orderId: number;
    status: string;
    confirmedAt: string;
  }>(`/orders/${orderId}/confirm`);
  return response.data;
};

// ─────────────────────────────────────────────
// 결제 (토스페이먼츠)
// ─────────────────────────────────────────────

/**
 * 결제 승인 요청
 * POST /api/payments/confirm
 * 토스페이먼츠 결제창에서 결제 완료 후 successUrl로 돌아왔을 때 호출합니다.
 * 서버가 토스 API에 최종 승인 요청을 보내고 주문 상태를 PAID로 변경합니다.
 *
 * @param paymentKey 토스가 발급한 결제 키
 * @param orderId    결제 요청 시 사용한 tossOrderId
 * @param amount     결제 금액
 * @returns 토스 결제 승인 결과 (paymentKey, orderId, status, totalAmount, method)
 */
export const confirmPayment = async (
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<{
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
}> => {
  const response = await axiosInstance.post('/api/payments/confirm', {
    paymentKey,
    orderId,
    amount,
  });
  return response.data;
};

/**
 * 결제 취소
 * POST /api/payments/cancel
 * 결제 후 주문을 취소할 때 호출합니다.
 * @param orderId      취소할 주문 ID (숫자)
 * @param cancelReason 취소 사유 (기본값: '고객 변심')
 */
export const cancelPayment = async (
  orderId: number,
  cancelReason: string = '고객 변심'
): Promise<void> => {
  await axiosInstance.post('/api/payments/cancel', {
    orderId,
    cancelReason,
  });
};