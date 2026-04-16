import React from 'react'
import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

/**
 * 상품 상세 페이지
 *
 * useLocalSearchParams로 URL 파라미터에서 상품 id를 받습니다.
 * 예: /product/42 → id = '42'
 *
 * TODO: UI 및 로직 구현 필요
 */
export default function ProductDetail(): JSX.Element {
  // URL 파라미터에서 id 값을 추출합니다.
  // 타입 파라미터 <{ id: string }>으로 TypeScript가 id를 string으로 인식하게 합니다.
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-base text-gray-400">상품 상세 페이지 (id: {id})</Text>
    </View>
  )
}
