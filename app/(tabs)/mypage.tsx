import AuthGuard from '@/src/components/auth/AuthGuard'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { Text } from 'react-native'

/**
 * 마이페이지 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function MypageScreen() {
  return (
    <AuthGuard redirectTo='/(tabs)/mypage'>
      <ScreenWrapper edges={['top']}>
        <Text className="text-base text-gray-400">마이페이지 페이지</Text>
      </ScreenWrapper>
    </AuthGuard>
  )
}
