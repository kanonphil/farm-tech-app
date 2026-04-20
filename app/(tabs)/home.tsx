import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import HomeHeader from '@/src/components/home/HomeHeader'
import React from 'react'
import { Text } from 'react-native'

/**
 * 홈 페이지 (상품 목록)
 * TODO: UI 및 로직 구현 필요
 */
export default function HomeScreen() {
  return (
    <ScreenWrapper edges={['top']}>
      <HomeHeader />
    </ScreenWrapper>
  )
}
