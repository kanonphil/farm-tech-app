import React from 'react'
import { Text } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import AuthGuard from '@/src/components/auth/AuthGuard'

/**
 * 알림 목록 페이지
 * 로그인 사용자만 접근 가능
 * TODO: UI 및 로직 구현 필요
 */
export default function notificationScreen() {
  return (
    <AuthGuard redirectTo='/notification'>
      <ScreenWrapper>
        <Text className='text-base text-gray-400'>알림 목록</Text>
      </ScreenWrapper>
    </AuthGuard>
  )
}