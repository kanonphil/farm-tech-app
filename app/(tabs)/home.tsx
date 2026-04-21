import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import HomeBanner from '@/src/components/home/HomeBanner'
import HomeHeader from '@/src/components/home/HomeHeader'
import HomeRecommend from '@/src/components/home/HomeRecommend'
import HomeSortBar from '@/src/components/home/HomeSortBar'
import React, { useState } from 'react'
import { Text } from 'react-native'

/**
 * 홈 페이지 (상품 목록)
 * TODO: UI 및 로직 구현 필요
 */
export default function HomeScreen() {
  // 현재 선택된 정렬 값
  const [sort, setSort] = useState<string | null>(null)
  return (
    <ScreenWrapper edges={['top']}>
      <HomeHeader />
      <HomeBanner />
      <HomeRecommend />
      <HomeSortBar onSortChange={(value) => setSort(value)}/>
    </ScreenWrapper>
  )
}
