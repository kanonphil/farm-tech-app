import { login } from '@/src/api/authApi'
import AppButton from '@/src/components/common/AppButton'
import AppInput from '@/src/components/common/AppInput'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

/**
 * 탭 화면 내 인라인 로그인 폼
 * 탭바를 유지한 채로 로그인 화면을 보여줄 때 사용
 */
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken, setRefreshToken, showToast } = useAuthStore()

  const handleLogin = async () => {
    if (!email.trim()) return showToast('이메일을 입력해주세요.')
    if (!password) return showToast('비밀번호를 입력해주세요.')
    try {
      setLoading(true)
      const response = await login({ memberEmail: email, memberPw: password, autoLogin: true })
      const token = response.headers['authorization']?.replace('Bearer ', '')
      const refreshToken = response.headers['refresh-token']
      if (token) {
        await setToken(token, refreshToken)
        if (refreshToken) await setRefreshToken(refreshToken)
      } else {
        showToast('로그인에 실패했습니다.')
      }
    } catch {
      showToast('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper scroll style={{ paddingHorizontal: 30 }}>
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#e63946' }}>한우마루</Text>
        <Text style={{ fontSize: 14, color: '#999', marginTop: 8 }}>신선한 한우를 문 앞까지</Text>
      </View>
      <AppInput
        label="이메일"
        placeholder="이메일을 입력하세요"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AppInput
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChangeText={setPassword}
        isPassword
      />
      <View style={{ width: '100%', marginBottom: 16 }}>
        <AppButton title="로그인" onPress={handleLogin} loading={loading} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, color: '#999' }}>아직 계정이 없으신가요?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')} style={{ marginLeft: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#e63946' }}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}
