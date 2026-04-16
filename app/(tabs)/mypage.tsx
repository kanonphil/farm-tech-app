import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import React from 'react'
import { View, Text } from 'react-native'

/**
 * 마이페이지 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function MypageScreen(): React.JSX.Element {
  return (
    <ScreenWrapper edges={['top']}>
      <Text className="text-base text-gray-400">마이페이지 페이지</Text>
    </ScreenWrapper>
  )
}
