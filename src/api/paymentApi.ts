import { PaymentConfirmRequest, PaymentConfirmResponse } from '@/src/types'
import { axiosInstance } from './axiosInstance'

/**
 * 결제 확인 API
 *
 * Toss 결제 완료 후 반드시 호출해야 합니다.
 * 서버에서 Toss API로 결제를 검증하고 주문 상태를 PAID로 변경합니다.
 *
 * 검증 내용 (서버 측):
 *  1. paymentKey / orderId / amount 유효성 확인
 *  2. Toss API 호출로 실제 결제 여부 확인
 *  3. amount 위변조 검사 (DB 금액과 비교)
 *  4. 주문 상태 PAID 업데이트 + 재고 감소
 *
 * POST /api/payments/confirm
 */
export const confirmPayment = async (
  request: PaymentConfirmRequest,
): Promise<PaymentConfirmResponse> => {
  const response = await axiosInstance.post<PaymentConfirmResponse>(
    '/api/payments/confirm',
    request,
  )
  return response.data
}