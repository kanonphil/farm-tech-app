import AuthGuard from '@/src/components/auth/AuthGuard'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { Text } from 'react-native'

/**
 * 주문/결제 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function CheckoutScreen() {
  return (
    <AuthGuard redirectTo='/order/checkout'>
      <ScreenWrapper scroll>
        <Text className="text-base text-gray-400">주문/결제 페이지</Text>
      </ScreenWrapper>
    </AuthGuard>
  )
}
