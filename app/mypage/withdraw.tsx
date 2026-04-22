import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import AppInput from '@/src/components/common/AppInput'
import AppButton from '@/src/components/common/AppButton'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { confirmPassword, withdrawMember } from '@/src/api/authApi'
import useAuthStore from '@/src/store/authStore'

export default function WithdrawScreen() {
  const [password, setPassword]   = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, showAlert, clearToken } = useAuthStore()

  const handleWithdraw = () => {
    if (!password) return showToast('비밀번호를 입력해주세요.')

    showAlert(
      '정말 탈퇴하시겠습니까?\n모든 정보가 삭제되며 복구가 불가능합니다.',
      async () => {
        setIsLoading(true)
        try {
          await confirmPassword(password)
          await withdrawMember()
          await clearToken()
          showToast('탈퇴가 완료되었습니다.')
          router.replace('/(tabs)/home')
        } catch (error: any) {
          const msg = error?.response?.data?.message ?? ''
          if (msg.includes('비밀번호') || msg.includes('일치')) {
            showToast('비밀번호가 올바르지 않습니다.')
          } else {
            showToast('탈퇴 처리에 실패했습니다.')
          }
        } finally {
          setIsLoading(false)
        }
      }
    )
  }

  return (
    <ScreenWrapper scroll edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text className="text-base font-bold text-[#1a1a1a]">회원 탈퇴</Text>
      </View>

      {/* 경고 박스 */}
      <View className="mx-5 mt-6 bg-[#fef2f2] rounded-xl p-4 border border-[#fecaca]">
        <View className="flex-row items-center gap-x-2 mb-2">
          <Ionicons name="warning-outline" size={18} color="#ef4444" />
          <Text className="text-sm font-semibold text-[#ef4444]">탈퇴 전 확인해주세요</Text>
        </View>
        {[
          '탈퇴 시 모든 주문 내역, 리뷰가 삭제됩니다.',
          '삭제된 데이터는 복구가 불가능합니다.',
          '진행 중인 주문이 있다면 탈퇴가 제한될 수 있습니다.',
        ].map((text) => (
          <Text key={text} className="text-xs text-[#b91c1c] mt-1">• {text}</Text>
        ))}
      </View>

      <View className="px-5 mt-6">
        <AppInput
          label="비밀번호 확인"
          value={password}
          onChangeText={setPassword}
          placeholder="현재 비밀번호를 입력하세요"
          isPassword
        />
        <AppButton
          title="탈퇴하기"
          onPress={handleWithdraw}
          loading={isLoading}
          style={{ width: '100%', marginTop: 16, backgroundColor: '#ef4444' }}
        />
      </View>
    </ScreenWrapper>
  )
}