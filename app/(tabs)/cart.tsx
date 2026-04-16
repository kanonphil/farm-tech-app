import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { View, Text } from 'react-native'

/**
 * 장바구니 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function CartScreen(): React.JSX.Element {
  return (
    <ScreenWrapper edges={['top']}>
      <Text className="text-base text-gray-400">장바구니 페이지</Text>
    </ScreenWrapper>
  )
}
