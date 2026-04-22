import React, { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import AppInput from '@/src/components/common/AppInput'
import AppButton from '@/src/components/common/AppButton'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { changePassword } from '@/src/api/authApi'
import useAuthStore from '@/src/store/authStore'

export default function ChangePasswordScreen() {
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const showToast = useAuthStore((state) => state.showToast)

  const handleChange = async () => {
    if (!currentPw)          return showToast('현재 비밀번호를 입력해주세요.')
    if (!newPw)              return showToast('새 비밀번호를 입력해주세요.')
    if (newPw.length < 8)    return showToast('비밀번호는 8자 이상이어야 합니다.')
    if (newPw !== confirmPw) return showToast('새 비밀번호가 일치하지 않습니다.')
    if (currentPw === newPw) return showToast('현재 비밀번호와 다른 비밀번호를 입력해주세요.')

    setIsLoading(true)
    try {
      await changePassword({ currentPw, newPw })
      showToast('비밀번호가 변경되었습니다.')
      router.back()
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? ''
      if (msg.includes('일치') || msg.includes('틀')) {
        showToast('현재 비밀번호가 올바르지 않습니다.')
      } else {
        showToast('비밀번호 변경에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
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
        <Text className="text-base font-bold text-[#1a1a1a]">비밀번호 변경</Text>
      </View>

      <View className="px-5 pt-4 gap-y-1">
        <AppInput
          label="현재 비밀번호"
          value={currentPw}
          onChangeText={setCurrentPw}
          placeholder="현재 비밀번호를 입력하세요"
          isPassword
        />
        <AppInput
          label="새 비밀번호"
          value={newPw}
          onChangeText={setNewPw}
          placeholder="8자 이상 입력하세요"
          isPassword
        />
        <AppInput
          label="새 비밀번호 확인"
          value={confirmPw}
          onChangeText={setConfirmPw}
          placeholder="새 비밀번호를 다시 입력하세요"
          isPassword
        />
        <AppButton
          title="변경하기"
          onPress={handleChange}
          loading={isLoading}
          style={{ width: '100%', marginTop: 16 }}
        />
      </View>
    </ScreenWrapper>
  )
}