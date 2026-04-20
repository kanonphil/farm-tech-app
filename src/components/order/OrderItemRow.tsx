import { CartItem } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import React from 'react'
import { View, Text, Image } from 'react-native'

/**
 * 결제 화면의 개별 주문 아이템 행 컴포넌트
 *
 * CartItem 컴포넌트와 다른 점:
 *  - 읽기 전용 (수량 변경 / 삭제 버튼 없음)
 *  - 수량은 "2개" 텍스트로만 표시
 *  - 단가와 소계(단가 × 수량)를 함께 표시
 *
 * @param item 장바구니 아이템 (상품 정보 포함)
 */

interface OrderItemRowProps {
  item: CartItem
}

export default function OrderItemRow({ item }: OrderItemRowProps) {
  const { cartItemQty, product } = item
  const subtotal = product.productPrice * cartItemQty
  
  return (
    <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
      
      {/* ── 상품 이미지 ────────────────────────────── */}
      <Image
        source={{ uri: product.mainImgUrl }}
        className="h-16 w-16 rounded-lg bg-[#f4f4f4]"
        resizeMode="cover"
      />

      {/* ── 상품 정보 ──────────────────────────────── */}
      <View className='ml-3 flex-1'>

        {/* 상품명 */}
        <Text 
          className='text-sm font-medium text-[#1a1a1a]'
          numberOfLines={2}
        >
          {product.productName}
        </Text>

        {/* 단가 */}
        <Text className='mt-0.5 text-xs text-[#888]'>
          {formatPrice(product.productPrice)} / 개
        </Text>

        {/* 수량 + 소계 */}
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-xs text-[#555]">
            수량 {cartItemQty}개
          </Text>
          <Text className="text-sm font-bold text-[#1a1a1a]">
            {formatPrice(subtotal)}
          </Text>
        </View>

      </View>
    </View>
  )
}