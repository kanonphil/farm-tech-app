import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { Text } from 'react-native'

/**
 * 홈 페이지 (상품 목록)
 * TODO: UI 및 로직 구현 필요
 */
export default function HomeScreen() {
  return (
    <ScreenWrapper edges={['top']}>
      <Text className="text-base text-gray-400">홈 페이지</Text>
      
    </ScreenWrapper>
  )
}
