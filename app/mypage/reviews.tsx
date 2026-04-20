import AuthGuard from '@/src/components/auth/AuthGuard'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { Text } from 'react-native'

/**
 * 리뷰 관리 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function ReviewsScreen() {
  return (
    <AuthGuard redirectTo='/mypage/reviews'>
      <ScreenWrapper edges={['bottom']}>
        <Text className="text-base text-gray-400">리뷰 관리 페이지</Text>
      </ScreenWrapper>
    </AuthGuard>
  )
}
