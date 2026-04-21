import AppButton from '@/src/components/common/AppButton'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'


/**
 * 마이페이지 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function MypageScreen() {
  //로그인 상태확인(token이 있으면 로그인, null이면 비로그인)
  const token = useAuthStore((state) => state.token)

  //로그아웃 함수 가져오기
  const {clearToken} =useAuthStore()
  const handleLogout = async() => {
    // 토큰 삭제 -> 비로그인 상태로 전환
    await clearToken()
  }
  if(!token){
    return(
      <ScreenWrapper edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 }}>
           {/* 사람 아이콘 */}
          <Ionicons name="person-circle-outline" size={80} color="#ddd" />

          {/* 안내 텍스트 */}
          <Text className="text-lg font-semibold text-[#1a1a1a]">로그인이 필요해요</Text>
          <Text className="text-sm text-gray-400 text-center">
            로그인하고 주문내역, 리뷰 등{'\n'}다양한 서비스를 이용해보세요
          </Text>

          {/* 로그인 버튼 */}
          <AppButton
            title="로그인"
            onPress={() => router.push('/auth/login')}
            style={{ width: '100%', marginTop: 8 }}
          />

          {/* 회원가입 버튼 */}
          <AppButton
            title="회원가입"
            variant="outline"
            onPress={() => router.push('/auth/signup')}
            style={{ width: '100%' }}
          />
        </View>
      </ScreenWrapper>
    )
  }

  //
  return (
    // <AuthGuard redirectTo='/(tabs)/mypage'>
      <ScreenWrapper edges={['top']}>
        <Text className="text-base text-gray-400">마이페이지 페이지</Text>
        {/* 로그아웃 */}
        <AppButton
          title='로그아웃'
          variant='outline'
          onPress={handleLogout}
          style={{width:'100%', marginTop:16}}
        />
      </ScreenWrapper>
    // </AuthGuard>
  )
}
