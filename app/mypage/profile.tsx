import { getMyInfo } from '@/src/api/authApi'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { Colors } from '@/src/constants/colors'
import useAuthStore from '@/src/store/authStore'
import { Member } from '@/src/types'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

/** 레이블 + 값 한 행 */
function InfoRow({ label, value }: {
  label: string
  value: string 
}) {
  return (
    <View className='flex-row items-center justify-between py-3.5 border-b border-[#f0f0f0]'>
      <Text className='text-sm text-[#888] w-24'>{label}</Text>
      <Text className='flex-1 text-sm text-[#1a1a1a] text-right'>{value || '-'}</Text>
    </View>
  )
}

/**
 * 내 정보 수정 페이지
 */
export default function ProfileScreen() {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const showToast = useAuthStore((state) => state.showToast)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      setMember(await getMyInfo())
    } catch (error) {
      showToast('정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useFocusEffect(useCallback(() => {
    loadData()
  }, [loadData]))
  
  return (
    <ScreenWrapper edges={['top']}>
      {/* 헤더 */}
      <View className='flex-row items-center border-b border-[#eee] bg-white px-4 py-4'>
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          className='mr-3'
        >
          <Ionicons name='arrow-back' size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text className='flex-1 text-base font-bold text-[#1a1a1a]'>내 정보</Text>
        <Pressable
          onPress={() => router.push('/mypage/edit-profile')}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Text style={{ color: Colors.primary }} className='text-sm'>수정</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <View className='bg-white px-4 mt-2'>
          <InfoRow label='이름' value={member?.memberName ?? ''} />
          <InfoRow label='이메일' value={member?.memberEmail ?? ''} />
          <InfoRow label='전화번호' value={member?.memberPhone ?? ''} />
          <InfoRow label='생년월일' value={member?.memberBirth ?? ''} />
          <InfoRow label='주소' value={member?.memberAddr ?? ''} />
          <InfoRow label='상세주소' value={member?.memberAddrDetail ?? ''} />
        </View>
      )}
    </ScreenWrapper>
  )
}
