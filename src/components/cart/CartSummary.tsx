import { formatPrice } from '@/src/utils/format'
import React from 'react'
import { View, Text } from 'react-native'
import AppButton from '../common/AppButton'

/**
 * 장바구니 하단 결제 요약 컴포넌트
 *
 * 선택된 상품의 총 금액과 주문하기 버튼을 표시합니다.
 * 선택된 상품이 없으면 버튼이 비활성화됩니다.
 *
 * @param selectedCount 선택된 상품 개수
 * @param totalPrice    선택된 상품들의 합산 금액
 * @param onCheckout    주문하기 버튼 클릭 시 호출
 * @param isLoading     주문 처리 중 여부 (버튼 스피너)
 */

interface CartSummaryProps {
  selectedCount: number
  totalPrice: number
  onCheckout: () => void
  isLoading?: boolean
}

export default function CartSummary({
  selectedCount,
  totalPrice,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  return (
    <View className="border-t border-[#eee] bg-white px-4 pb-4 pt-3">

      {/* 선택 수량 + 합계 금액 */}
      <View className='mb-3 flex-row items-center justify-between'>
        <Text className='text-sm text-[#555]'>
          선택 상품 {selectedCount}개
        </Text>
        <Text className='text-lg font-bold text-[#1a1a1a]'>
          {formatPrice(totalPrice)}
        </Text>
      </View>

      {/**
       * 선택된 상품이 없으면 disabled 처리됨.
       * AppButton의 disabled prop이 opacity와 터치 차단을 모두 처리.
       */}
      <AppButton 
        title={selectedCount > 0 ? `${selectedCount}개 주문하기` : '상품을 선택해주세요'}
        onPress={onCheckout}
        disabled={selectedCount === 0}
        loading={isLoading}
        size='lg'
      />
      
    </View>
  )
}