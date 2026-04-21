import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { router, useLocalSearchParams } from 'expo-router'
import useAuthStore from '@/src/store/authStore'
import { TossSuccessParams } from '@/src/types'
import { confirmPayment } from '@/src/api/paymentApi'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import TossPaymentWebView from '@/src/components/order/TossPaymentWebView'

/**
 * Toss 결제 화면
 *
 * 진입 경로:
 *   checkout.tsx → router.push('/order/payment?tossOrderId=...&amount=...&orderName=...')
 *
 * 흐름:
 *   1. URL params 에서 결제 정보 파싱
 *   2. TossPaymentWebView 렌더링
 *   3. 결제 성공 → confirmPayment() (서버 검증) → 완료 화면
 *   4. 결제 실패 → 토스트 → 뒤로가기
 *
 * ⚠️ router.replace 를 쓰는 이유:
 *   결제 완료 후 뒤로가기 시 결제 화면으로 돌아오면 안 됩니다.
 */
export default function PaymentScreen() {
  const {
    tossOrderId,
    amount: amountParam,
    orderName,
  } = useLocalSearchParams<{
    tossOrderId: string
    amount: string
    orderName: string
  }>()

  /**
   * amount 는 URL param 이라 문자열 → 숫자 변환 필요
   * 변환 실패 시 0 으로 fallback (서버에서 금액 재검증하므로 보안상 문제 없음)
   */
  const amount = parseInt(amountParam ?? '0', 10)

  /** 서버 결제 확인 중 여부 - 이 시간 동안 뒤로가기 차단 */
  const [isConfirming, setIsConfirming] = useState(false)

  const showToast = useAuthStore((state) => state.showToast)

  // ─────────────────────────────────────────────
  // 결제 성공 핸들러
  // ─────────────────────────────────────────────

  /**
   * Toss 결제 성공 후 서버 검증을 수행합니다.
   *
   * 서버에서 Toss API 재확인 → 재고 차감 → 주문 PAID 처리가 이뤄집니다.
   * 서버 처리 실패 시 Toss 자동 취소(환불)가 진행됩니다.
   */
  const handleSuccess = useCallback(
    async (params: TossSuccessParams) => {
      setIsConfirming(true)

      try {
        await confirmPayment({
          paymentKey: params.paymentKey,
          orderId: params.orderId,
          amount: parseInt(params.amount, 10),
        })

        // 결제 완료 — replace 로 스택에서 payment 를 제거해 뒤로가기 방지
        router.replace(`/order/complete?tossOrderId=${params.orderId}`)
      } catch (error: any) {
        const serverMessage: string = error?.response?.data?.message ?? ''
        if (serverMessage.includes('자동 환불')) {
          showToast('결제 처리 중 오류가 발생하여 자동 환불되었습니다.')
        } else {
          showToast('결제 확인에 실패했습니다. 고객센터에 문의해주세요.')
        }
        setIsConfirming(false)
      }
    },
    [showToast],
  )

  // ─────────────────────────────────────────────
  // 결제 실패 핸들러
  // ─────────────────────────────────────────────

  /**
   * 결제 취소 또는 실패 시 호출됩니다.
   * 토스트를 띄우고 결제 화면을 닫아 checkout 으로 돌아갑니다.
   */
  const handleFail = useCallback(
    (message: string) => {
      showToast(message || '결제에 실패했습니다.')
      router.back()
    },
    [showToast],
  )

  return (
    <ScreenWrapper edges={['top']}>

      {/* ── 헤더 ────────────────────────────────── */}
      <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
        {/**
         * 결제 확인 중에는 뒤로가기 차단
         * 확인 중 이탈하면 결제는 됐는데 주문이 PAID 안 되는 상황 발생 가능
         */}
        <TouchableOpacity
          onPress={() => !isConfirming && router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3"
          disabled={isConfirming}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isConfirming ? Colors.textMuted : Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text className="text-base font-bold text-[#1a1a1a]">결제</Text>
      </View>

      {/* ── 서버 결제 확인 중 오버레이 ─────────────── */}
      {isConfirming && (
        <View
          className="absolute inset-0 z-10 items-center justify-center bg-white/90"
          style={{ top: 56 }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-3 text-sm text-[#555]">결제를 확인하는 중입니다...</Text>
          <Text className="mt-1 text-xs text-[#999]">잠시만 기다려주세요</Text>
        </View>
      )}

      {/* ── Toss 결제 WebView ──────────────────── */}
      {tossOrderId && amount > 0 ? (
        <TossPaymentWebView
          tossOrderId={tossOrderId}
          amount={amount}
          orderName={orderName ?? '한우마루 주문'}
          onSuccess={handleSuccess}
          onFail={handleFail}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-[#999]">
            결제 정보를 불러올 수 없습니다.
          </Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-sm text-primary">돌아가기</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScreenWrapper>
  )
}