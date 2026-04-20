import { Colors } from '@/src/constants/colors'
import { CartItem as CartItemType } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

/**
 * 장바구니 개별 상품 행 컴포넌트
 *
 * @param item       장바구니 항목 (상품 정보 포함)
 * @param isSelected 체크박스 선택 여부
 * @param onSelect   체크박스 클릭 시 호출 — cartItemId 전달
 * @param onQtyChange 수량 변경 시 호출 — (cartItemId, 새 수량) 전달
 * @param onDelete   삭제 버튼 클릭 시 호출 — cartItemId 전달
 */

interface CartItemProps {
  item: CartItemType
  isSelected: boolean
  // cartItemId를 인자로 받음. 반환값 없음
  onSelect: (cartItemId: number) => void
  onQtyChange: (cartItemId: number, qty: number) => void
  onDelete: (cartItemId: number) => void
}

export default function CartItem({
  item,
  isSelected,
  onSelect,
  onQtyChange,
  onDelete,
}: CartItemProps) {
  // 자주 쓰는 값 미리 구조분해
  const { cartItemId, cartItemQty, product } = item
  
  return (
    <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
      {/* ── 체크박스 ──────────────────────────────── */}
      <TouchableOpacity
        onPress={() => onSelect(cartItemId)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className='mr-3'
      >
        <Ionicons 
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>

      {/* ── 상품 이미지 ────────────────────────────── */}
      {/** 
       * product.mainImgUrl을 S3 전체 URL이 저장되어 있으므로 그대로 사용함.
       * 별도 BASE_URL 조합 불필요
       */}
      <Image 
        source={{ uri: product.mainImgUrl }}
        className='h-20 w-20 rounded-lg bg-[#f4f4f4]'
        resizeMode='cover'
      />

      {/* ── 상품 정보 영역 ──────────────────────────── */}
      <View className='ml-3 flex-1'>

        {/* 상품명 + 삭제 버튼 */}
        <View className='flex-row items-start justify-between'>
          <Text
            className='mr-2 flex-1 text-sm font-medium text-[#1a1a1a]'
            numberOfLines={2}
          >
            {product.productName}
          </Text>
          <TouchableOpacity
            onPress={() => onDelete(cartItemId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name='close' size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 가격 — 단가 × 수량 */}
        <Text className='mt-1 text-base font-bold text-[#1a1a1a]'>
          {formatPrice(product.productPrice * cartItemQty)}
        </Text>

        {/* ── 수량 조절 ─────────────────────────── */}
        <View className='mt-2 flex-row items-center'>

          {/* 감소 버튼 — 수량이 1이면 비활성화 */}
          <TouchableOpacity
            onPress={() => onQtyChange(cartItemId, cartItemQty - 1)}
            disabled={cartItemQty <= 1}
            className='h-7 w-7 items-center justify-center rounded border border-[#ddd]'
          >
            <Ionicons 
              name='remove'
              size={14}
              color={cartItemQty <= 1 ? Colors.textMuted : Colors.textPrimary}
            />
          </TouchableOpacity>

          {/* 현재 수량 */}
          <Text className='mx-3 text-sm font-medium text-[#1a1a1a]'>
            {cartItemQty}
          </Text>

          {/* 증가 버튼 */}
          <TouchableOpacity
            onPress={() => onQtyChange(cartItemId, cartItemQty + 1)}
            className='h-7 w-7 items-center justify-center rounded border border-[#ddd]'
          >
            <Ionicons name='add' size={14} color={Colors.textPrimary} />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  )
}