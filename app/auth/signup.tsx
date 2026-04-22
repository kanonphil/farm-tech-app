import { checkEmailDuplicate, registerMember } from '@/src/api/authApi'
import AppButton from '@/src/components/common/AppButton'
import AppInput from '@/src/components/common/AppInput'
import BirthDatePicker from '@/src/components/common/BirthDatePicker'
import DaumPostcodeModal from '@/src/components/common/DaumPostcodeModal'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { Colors } from '@/src/constants/colors'
import useAuthStore from '@/src/store/authStore'
import { DaumAddressData } from '@/src/types'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SignupScreen() {
  const { showToast } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [addrModalVisible, setAddrModalVisible] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [form, setForm] = useState({
    memberEmail: '',
    memberPw: '',
    memberName: '',
    memberPhone: '010',
    memberBirth: '',
    memberAddr: '',
    memberAddrDetail: '',
  })

  const [error, setError] = useState({
    memberEmail: '',
    memberPw: '',
    confirmPw: '',
    memberName: '',
    memberPhone: '',
  })

  const [confirmPw, setConfirmPw] = useState('')

  const handleChange = (field: string) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }
  const checkEmail = async () => {
    if (!form.memberEmail.trim()) {
      showToast('이메일을 입력해주세요.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.memberEmail)) {
      setError(prev => ({ ...prev, memberEmail: '이메일 형식이 올바르지 않습니다' }))
      return
    }
    try {
      const isDuplicate = await checkEmailDuplicate(form.memberEmail)
      if (isDuplicate) {
        setError(prev => ({ ...prev, memberEmail: '이미 사용 중인 이메일입니다' }))
      } else {
        showToast('사용 가능한 이메일입니다.')
        setError(prev => ({ ...prev, memberEmail: '' }))
      }
    } catch {
      showToast('이메일 확인 중 오류가 발생했습니다.')
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handleSignup = async () => {
    const newErrors = { memberEmail: '', memberPw: '', confirmPw: '', memberName: '', memberPhone: '' }
    let hasError = false

    if (!form.memberEmail.trim()) { newErrors.memberEmail = '이메일을 입력해주세요'; hasError = true }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.memberEmail)) { newErrors.memberEmail = '이메일 형식이 올바르지 않습니다'; hasError = true }
    if (!form.memberPw) { newErrors.memberPw = '비밀번호를 입력해주세요'; hasError = true }
    if (form.memberPw && form.memberPw !== confirmPw) { newErrors.confirmPw = '비밀번호가 일치하지 않습니다'; hasError = true }
    if (!form.memberName.trim()) { newErrors.memberName = '이름을 입력해주세요'; hasError = true }
    if (form.memberPhone.replace(/\D/g, '').length < 10) { newErrors.memberPhone = '전화번호를 입력해주세요'; hasError = true }

    setError(newErrors)
    if (hasError) return

    if (!form.memberBirth) {
      showToast('생년월일을 선택해주세요.')
      return
    }

    if (!agreed) {
      showToast('이용약관에 동의해주세요.')
      return
    }

    try {
      setLoading(true)
      await registerMember(form)
      showToast('회원가입이 완료되었습니다.')
      router.replace('/auth/login')
    } catch {
      showToast('회원가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper scroll style={styles.wrapper}>

      {/* 헤더 */}
      <View style={styles.header}>
<Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>한우마루와 함께 신선한 한우를 만나보세요</Text>
      </View>

      {/* 입력 폼 */}
      {/* 이메일 — 중복확인 버튼 포함, raw TextInput 사용 */}
      <View style={styles.emailWrapper}>
        <Text style={styles.inputLabel}>이메일</Text>
        <View style={[styles.emailRow, error.memberEmail ? styles.emailRowError : styles.emailRowNormal]}>
          <TextInput
            style={styles.emailInput}
            value={form.memberEmail}
            onChangeText={handleChange('memberEmail')}
            keyboardType='email-address'
            autoCapitalize='none'
            placeholder='이메일을 입력해주세요'
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity onPress={checkEmail} activeOpacity={0.7}>
            <Text style={styles.checkBtn}>중복확인</Text>
          </TouchableOpacity>
        </View>
        {error.memberEmail ? (
          <Text style={styles.errorText}>{error.memberEmail}</Text>
        ) : null}
      </View>

      <AppInput
        label='비밀번호'
        value={form.memberPw}
        onChangeText={handleChange('memberPw')}
        isPassword
        placeholder='비밀번호를 입력해주세요'
        error={error.memberPw}
      />
      <AppInput
        label='비밀번호 확인'
        value={confirmPw}
        onChangeText={setConfirmPw}
        isPassword
        placeholder='비밀번호를 다시 입력해주세요'
        error={error.confirmPw}
      />
      <AppInput
        label='이름'
        value={form.memberName}
        onChangeText={handleChange('memberName')}
        placeholder='이름을 입력해주세요'
        error={error.memberName}
      />
      <AppInput
        label='전화번호'
        value={form.memberPhone}
        onChangeText={v => handleChange('memberPhone')(formatPhone(v))}
        keyboardType='phone-pad'
        maxLength={13}
        error={error.memberPhone}
      />

      <BirthDatePicker
        value={form.memberBirth}
        onChange={handleChange('memberBirth')}
      />

      <TouchableOpacity onPress={() => setAddrModalVisible(true)}>
        <AppInput
          label='주소'
          value={form.memberAddr}
          placeholder='클릭하여 주소를 검색해주세요'
          editable={false}
          pointerEvents='none'
        />
      </TouchableOpacity>

      <DaumPostcodeModal
        visible={addrModalVisible}
        onSelect={(data: DaumAddressData) => {
          handleChange('memberAddr')(data.roadAddress)
          setAddrModalVisible(false)
        }}
        onClose={() => setAddrModalVisible(false)}
      />

      <AppInput
        label='상세주소'
        value={form.memberAddrDetail}
        onChangeText={handleChange('memberAddrDetail')}
        placeholder='상세주소를 입력해주세요'
      />

      {/* 약관 동의 */}
      <TouchableOpacity
        style={styles.agreeRow}
        onPress={() => setAgreed(prev => !prev)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={agreed ? 'checkbox' : 'square-outline'}
          size={22}
          color={agreed ? Colors.primary : Colors.textMuted}
        />
        <Text style={styles.agreeText}>
          이용약관 및 개인정보처리방침에 동의합니다
        </Text>
      </TouchableOpacity>

      <AppButton
        title='회원가입'
        loading={loading}
        onPress={handleSignup}
        style={styles.submitBtn}
      />

      {/* 로그인 이동 */}
      <View style={styles.loginRow}>
        <Text style={styles.loginHint}>이미 계정이 있으신가요?</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginLink}>로그인</Text>
        </TouchableOpacity>
      </View>

    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  agreeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  submitBtn: {
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 4,
  },
  loginHint: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emailWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  emailRowNormal: {
    borderColor: '#ddd',
  },
  emailRowError: {
    borderColor: Colors.error,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  checkBtn: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.error,
  },
})
