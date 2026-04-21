import { registerMember } from '@/src/api/authApi'
import AppButton from '@/src/components/common/AppButton'
import AppInput from '@/src/components/common/AppInput'
import DaumPostcodeModal from '@/src/components/common/DaumPostcodeModal'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import { DaumAddressData } from '@/src/types'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

/**
 * 회원가입 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function SignupScreen() {
  const {showToast} =useAuthStore()
  const [loading,setLoading] = useState(false);
  const [addrModalVisible, setAddrModalVisible] =useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [birthDate,setBirthDate] =useState(new Date())

  const [form, setForm] =useState({
    memberEmail: '',
    memberPw:'',
    memberName:'',
    memberPhone:'',
    memberBirth:'',
    memberAddr:'',
    memberAddrDetail:''
  });
  const [error,setError] = useState({
    memberEmail: '',
    memberPw: '',
    confirmPw: '',
    memberName: '',
    memberPhone: ''
  })

  //비밀번호 확인
  const [confirmPw, setConfirmPw] = useState('')

  //필드 값 변경 핸들러
  const handleChange = (field:string) => (value:string) => {
    setForm(prev => ({...prev,[field] : value}))
  }



  const handleSignup = async () => {
     const newErrors = { memberEmail: '', memberPw: '', confirmPw: '',  memberName: '', memberPhone: '' }
     let hasError = false

    //유효성 검사
    if(!form.memberEmail.trim()) {newErrors.memberEmail = '이메일을 입력해주세요'; hasError = true}
    if(!form.memberPw) {newErrors.memberPw = '비밀번호를 입력해주세요'; hasError = true}
    if(form.memberPw && form.memberPw !== confirmPw) {newErrors.confirmPw = '비밀번호가 일치하지 않습니다'; hasError = true}
    if(!form.memberName.trim()) {newErrors.memberName = '이름을 입력해주세요'; hasError = true}
    if(!form.memberPhone.trim()) {newErrors.memberPhone = '전화번호를 입력해주세요'; hasError = true}

      setError(newErrors)
      if (hasError) return
    try{
      setLoading(true)
      await registerMember(form)
      showToast('회원가입이 완료되었습니다.')
      router.replace('/auth/login')
    }catch{
      showToast('회원가입에 실패했습니다. 다시 시도해주세요.')
    }finally{
      setLoading(false)
    }
  }
  
  return (
    <ScreenWrapper scroll style={{paddingHorizontal:30}}>
      <View>
        <Text>
          회원가입입니다
        </Text>
        <View style={{
          flexDirection:'row',
        }}>
          <AppButton 
            title='매니저'
          />
          <AppButton 
            title='일반회원'
          />
        </View>
        

        <AppInput
          label='이메일'
          value={form.memberEmail}
          onChangeText={handleChange('memberEmail')}
          keyboardType='email-address'
          error={error.memberEmail}
        />
        <AppInput
          label='비밀번호'
          value={form.memberPw}
          onChangeText={handleChange('memberPw')}
          isPassword
          error={error.memberPw}
        />
        <AppInput
          label='비밀번호 확인'
          value={confirmPw}
          onChangeText={setConfirmPw}
          isPassword
          error={error.confirmPw}
        />
        <AppInput
          label='이름'
          value={form.memberName}
          onChangeText={handleChange('memberName')}
          error={error.memberName}
        />
        <AppInput
          label='전화번호 ("-"를 빼고 입력해 주세요)'
          value={form.memberPhone}
          onChangeText={handleChange('memberPhone')}
          keyboardType="phone-pad"
          error={error.memberPhone}
        />
        <AppInput 
          label='생년월일'
          value={form.memberBirth}
          onChangeText={handleChange('memberBirth')}
          keyboardType="number-pad"
        />
        <TouchableOpacity onPress={() => setAddrModalVisible(true)}>
          <AppInput
            label='주소'
            value={form.memberAddr}
            placeholder='클릭하여 주소를 입력해주세요.'
            editable={false}
            pointerEvents='none'
          />
        </TouchableOpacity>

        <DaumPostcodeModal 
          visible={addrModalVisible}
          onSelect={(data : DaumAddressData) => {
            handleChange('memberAddr')(data.roadAddress)
            setAddrModalVisible(false)
          }}
          onClose={() => setAddrModalVisible(false)}
        />
          <AppInput 
            label='상세주소'
            value={form.memberAddrDetail}
            onChangeText={handleChange('memberAddrDetail')}
          />
        <AppButton 
          title='회원가입'
          loading={loading}
          onPress={handleSignup}
        />
      </View>
    </ScreenWrapper>
  )
}
