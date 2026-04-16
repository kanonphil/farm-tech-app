import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

/**
 * 공통 모달 화면
 *
 * Expo Router의 모달 라우트입니다.
 * router.push('/modal') 로 호출하면 아래에서 시트처럼 올라옵니다.
 *
 * 현재는 기본 틀만 작성되어 있습니다.
 * 나중에 필터 선택, 주소 검색 등 바텀 시트가 필요할 때
 * 이 파일을 확장하거나 props/params로 내용을 주입하세요.
 *
 * 사용 예시:
 *   router.push('/modal')          // 모달 열기
 *   router.back()                  // 모달 닫기
 */
export default function ModalScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-[#f9f9f9]">
      <Text className="mb-4 text-lg font-semibold text-[#1a1a1a]">
        모달
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="rounded-lg bg-[#e63946] px-6 py-3"
        activeOpacity={0.75}
      >
        <Text className="font-semibold text-white">닫기</Text>
      </TouchableOpacity>
    </View>
  )
}