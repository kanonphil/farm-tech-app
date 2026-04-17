import AuthGuard from '@/src/components/auth/AuthGuard'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuth from '@/src/hooks/useAuth'
import useAuthStore from '@/src/store/authStore'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { View, Text } from 'react-native'

/**
 * 장바구니 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function CartScreen() {
  return (
    <AuthGuard redirectTo='/(tabs)/cart'>
      <ScreenWrapper edges={['top']}>
        <Text className="text-base text-gray-400">장바구니 페이지</Text>
      </ScreenWrapper>
    </AuthGuard>
  )
}
