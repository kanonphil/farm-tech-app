import AuthGuard from '@/src/components/auth/AuthGuard'
import AppButton from '@/src/components/common/AppButton'
import DaumPostcodeModal from '@/src/components/common/DaumPostcodeModal'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import OrderItemRow from '@/src/components/order/OrderItemRow'
import { Colors } from '@/src/constants/colors'
import useCheckout from '@/src/hooks/useCheckout'
import { DaumAddressData } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

/**
 * 주문/결제 화면
 *
 * 진입 경로:
 *   cart.tsx → router.push('/order/checkout?cartItemIds=1,2,3')
 *
 * 흐름:
 *   1. URL params에서 cartItemIds 파싱
 *   2. useCheckout 훅으로 해당 아이템 로드
 *   3. 배송지 입력 (현재는 UI만 — 백엔드 OrderDTO에 address 필드 추가 후 연동)
 *   4. 결제하기 → submitOrder() → tossOrderId 받아 완료 화면으로 이동
 *
 * ⚠️ FlatList 대신 ScrollView + map을 쓰는 이유:
 *   결제 화면의 상품 수는 적고(보통 1~5개), 배송/결제 섹션이 함께 스크롤되어야
 *   하므로 ScrollView가 더 적합합니다. 수백 개 목록이라면 FlatList를 써야 합니다.
 */
export default function CheckoutScreen() {
  // ─────────────────────────────────────────────
  // URL params 파싱
  // ─────────────────────────────────────────────

  /**
   * useLocalSearchParams: Expo Router에서 URL query string을 읽는 훅
   * '/order/checkout?cartItemIds=1,2,3' → { cartItemIds: '1,2,3' }
   *
   * 주의: params 값은 항상 string | string[] 타입이므로 number[]로 변환 필요
   */
  const { cartItemIds: cartItemIdsParam } = useLocalSearchParams<{cartItemIds: string}>()

  /**
   * '1,2,3' → [1, 2, 3]
   * Number()가 NaN을 반환하는 경우를 filter(Boolean)로 제거
   */
  const cartItemIds = (cartItemIdsParam ?? '')
    .split(',')
    .map(Number)
    .filter(Boolean)

  // ─────────────────────────────────────────────
  // 훅 & 상태
  // ─────────────────────────────────────────────

  const { checkoutItems, isLoading, error, isSubmitting, totalPrice, loadItems, submitOrder } = useCheckout(cartItemIds)

  /** 다음 우편번호 API 응답 데이터 */
  const [selectedAddress, setSelectedAddress] = useState<DaumAddressData | null>(null)

  /** 상세 주소 (동/호수 등) */
  const [detailAddress, setDetailAddress] = useState('')

  /** 주소 검색 모달 표시 여부 */
  const [isPostcodeVisible, setIsPostcodeVisible] = useState(false)

  // ─────────────────────────────────────────────
  // 화면 진입 시 아이템 로드
  // ─────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadItems()
    }, [loadItems]),
  )

  // ─────────────────────────────────────────────
  // 주문 제출 핸들러
  // ─────────────────────────────────────────────

  /**
   * submitOrder() → tossOrderId 반환 → 완료 화면 이동
   * 네비게이션은 훅이 아닌 화면에서 처리합니다. (관심사 분리)
   */
  const handleSubmit = useCallback(async () => {
    const tossOrderId = await submitOrder()
    if (tossOrderId) {
      // 완료 화면으로 이동하면서 tossOrderId를 param으로 전달
      router.push(
        `/order/payment?tossOrderId=${tossOrderId}&amount=${totalPrice}&orderName=한우마루 주문`
      )
    }
  }, [submitOrder, totalPrice])

  // ─────────────────────────────────────────────
  // 렌더링 분기
  // ─────────────────────────────────────────────

  /**
   * submitOrder() → tossOrderId 반환 → 완료 화면 이동
   * 네비게이션은 훅이 아닌 화면에서 처리합니다. (관심사 분리)
   */

  if (isLoading) return <LoadingSpinner full />

  if (error) {
    return (
      <ScreenWrapper edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-[#999]">{error}</Text>
          <TouchableOpacity onPress={loadItems} className="mt-4">
            <Text className="text-sm text-primary">다시 시도</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    )
  }

  // ─────────────────────────────────────────────
  // 메인 렌더링
  // ─────────────────────────────────────────────
  
  return (
    <AuthGuard redirectTo='/order/checkout'>
      <ScreenWrapper scroll edges={[ 'top' ]}>

        {/* ── 헤더 ────────────────────────────────── */}
        <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-base font-bold text-[#1a1a1a]">주문/결제</Text>
        </View>

        {/* ── 주문 상품 섹션 ───────────────────────── */}
        <SectionHeader title="주문 상품" count={checkoutItems.length} />

        {checkoutItems.map((item) => (
          <OrderItemRow key={item.cartItemId} item={item} />
        ))}

        {/* ── 배송 정보 섹션 ───────────────────────── */}
        <SectionHeader title="배송 정보" />

        <View className="bg-white px-4 py-3 gap-y-3">

          {/* 주소 검색 버튼 */}
          <TouchableOpacity
            onPress={() => setIsPostcodeVisible(true)}
            className="flex-row items-center justify-between rounded-lg border border-[#ddd] px-3 py-2.5"
          >
            <Text className={selectedAddress ? 'text-sm text-[#1a1a1a]' : 'text-sm text-[#bbb]'}>
              {selectedAddress ? `[${selectedAddress.zonecode}] ${selectedAddress.roadAddress}` : '주소를 검색해주세요'}
            </Text>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* 건물명 — 있을 때만 표시 */}
          {selectedAddress?.buildingName ? (
            <Text className="text-xs text-[#888]">
              건물명: {selectedAddress.buildingName}
            </Text>
          ) : null}

          {/* 상세 주소 — 기본 주소 선택 후 활성화 */}
          <TextInput
            value={detailAddress}
            onChangeText={setDetailAddress}
            placeholder={selectedAddress ? '상세 주소를 입력해주세요 (동/호수 등)' : '먼저 주소를 검색해주세요'}
            placeholderTextColor="#bbb"
            editable={!!selectedAddress}
            className={`rounded-lg border px-3 py-2.5 text-sm text-[#1a1a1a] ${
              selectedAddress ? 'border-[#ddd]' : 'border-[#eee] bg-[#f9f9f9]'
            }`}
          />

        </View>

        {/* 다음 우편번호 모달 */}
        <DaumPostcodeModal
          visible={isPostcodeVisible}
          onSelect={(data: DaumAddressData) => {
            setSelectedAddress(data)
            setDetailAddress('')       // 주소 바꾸면 상세 주소 초기화
            setIsPostcodeVisible(false)
          }}
          onClose={() => setIsPostcodeVisible(false)}
        />

        {/* ── 결제 금액 섹션 ───────────────────────── */}
        <SectionHeader title="결제 금액" />

        <View className="bg-white px-4 py-3">

          {/* 상품 합계 */}
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-[#555]">상품 합계</Text>
            <Text className="text-sm text-[#1a1a1a]">{formatPrice(totalPrice)}</Text>
          </View>

          {/* 배송비 */}
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-[#555]">배송비</Text>
            <Text className="text-sm text-primary">무료</Text>
          </View>

          {/* 구분선 */}
          <View className="my-2 h-px bg-[#eee]" />

          {/* 최종 결제 금액 */}
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-base font-bold text-[#1a1a1a]">결제 금액</Text>
            <Text className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</Text>
          </View>

        </View>

        {/* ── 결제 버튼 ────────────────────────────── */}
        <View className="px-4 pb-6 pt-4">
          {/**
           * disabled 조건: 주소 미입력 또는 아이템 없음
           * 추후 Toss 결제 위젯 연동 시 이 버튼에서 위젯을 열면 됩니다.
           */}
          <AppButton
            title="결제하기"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!selectedAddress || !detailAddress.trim() || checkoutItems.length === 0}
            size="lg"
          />
        </View>
        
      </ScreenWrapper>
    </AuthGuard>
  )
}

// ─────────────────────────────────────────────
// 섹션 헤더 서브 컴포넌트
// ─────────────────────────────────────────────

/**
 * 각 섹션 상단에 표시되는 회색 구분 헤더
 * @param title 섹션 제목
 * @param count 선택 사항 — 상품 수 등 숫자 표시
 */
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View className="border-b border-[#eee] bg-[#f9f9f9] px-4 py-4">
      <Text className="text-xs font-semibold text-[#888]">
        {title}
        {count !== undefined && (
          <Text className="text-[#bbb]"> ({count}개)</Text>
        )}
      </Text>
    </View>
  )
}