import React, { useCallback, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import { getMyInfo, updateMyInfo } from '@/src/api/authApi'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import AppInput from '@/src/components/common/AppInput'
import AppButton from '@/src/components/common/AppButton'
import DaumPostcodeModal from '@/src/components/common/DaumPostcodeModal'
import { DaumAddressData } from '@/src/types'
import BirthDatePicker from '@/src/components/common/BirthDatePicker'

/**
 * 프로필 수정 화면
 */
export default function EditProfileScreen() {
  const showToast = useAuthStore((state) => state.showToast)

  const [memberName, setMemberName] = useState('')
  const [memberPhone, setMemberPhone] = useState('')
  const [memberBirth, setMemberBirth] = useState('')
  const [memberAddr, setMemberAddr] = useState('')
  const [memberAddrDetail, setMemberAddrDetail] = useState('')
  const [isPostcodeVisible, setIsPostcodeVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /** 기존 회원 정보로 폼 초기화 */
  const loadDate = useCallback(async () => {
    setIsLoading(true)
    try {
      const info = await getMyInfo()
      setMemberName(info.memberName)
      setMemberPhone(info.memberPhone)
      setMemberBirth(info.memberBirth)
      setMemberAddr(info.memberAddr)
      setMemberAddrDetail(info.memberAddrDetail)
    } catch (error) {
      showToast('정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useFocusEffect(useCallback(() => {
    loadDate()
  }, [loadDate]))

  const handleSave = async () => {
    if (!memberName.trim()) return showToast('이름을 입력해주세요.')
    if (!memberPhone.trim()) return showToast('전화번호를 입력해주세요.')
    if (!memberAddr.trim()) return showToast('주소를 입력해주세요.')

    setIsSaving(true)
    try {
      await updateMyInfo({
        memberName,
        memberPhone,
        memberBirth,
        memberAddr,
        memberAddrDetail,
      })
      showToast('정보가 수정되었습니다.')
      router.back()
    } catch (error) {
      showToast('수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <ScreenWrapper scroll edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-[#1a1a1a]">정보 수정</Text>
      </View>
      
      <View className="px-5 pt-4 gap-y-1">
        <AppInput label="이름" value={memberName} onChangeText={setMemberName}  placeholder="이름을 입력하세요" />
        <AppInput label="전화번호" value={memberPhone} onChangeText={setMemberPhone} placeholder="010-0000-0000" keyboardType="phone-pad" />
        <BirthDatePicker 
          value={memberBirth}
          onChange={setMemberBirth}
        />

        {/* 주소 검색 */}
        <Text className="text-sm font-medium text-[#333] mt-2 mb-1">주소</Text>
        <TouchableOpacity
          onPress={() => setIsPostcodeVisible(true)}
          className="flex-row items-center justify-between rounded-lg border border-[#ddd] px-3 py-2.5 mb-2"
        >
          <Text className={memberAddr ? 'text-sm text-[#1a1a1a]' : 'text-sm text-[#bbb]'}>
            {memberAddr || '주소를 검색해주세요'}
          </Text>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <AppInput
          label="상세 주소"
          value={memberAddrDetail}
          onChangeText={setMemberAddrDetail}
          placeholder="동/호수를 입력해주세요"
          editable={!!memberAddr}
        />

        <AppButton
          title="저장"
          onPress={handleSave}
          loading={isSaving || isLoading}
          style={{ width: '100%', marginTop: 16, marginBottom: 24 }}
        />
      </View>

      <DaumPostcodeModal
        visible={isPostcodeVisible}
        onSelect={(data: DaumAddressData) => {
          setMemberAddr(`[${data.zonecode}] ${data.roadAddress}`)
          setMemberAddrDetail('')
          setIsPostcodeVisible(false)
        }}
        onClose={() => setIsPostcodeVisible(false)}
      />
    </ScreenWrapper>
  )
}