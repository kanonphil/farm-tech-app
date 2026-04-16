import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { View, Text } from 'react-native'

/**
 * 주문 내역 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function OrdersScreen(): React.JSX.Element {
  return (
    <ScreenWrapper edges={['bottom']}>
      <Text className="text-base text-gray-400">주문 내역 페이지</Text>
    </ScreenWrapper>
  )
}
