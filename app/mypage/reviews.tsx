import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { View, Text } from 'react-native'

/**
 * 리뷰 관리 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function ReviewsScreen(): React.JSX.Element {
  return (
    <ScreenWrapper edges={['bottom']}>
      <Text className="text-base text-gray-400">리뷰 관리 페이지</Text>
    </ScreenWrapper>
  )
}
