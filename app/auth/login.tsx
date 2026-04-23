import { login } from '@/src/api/authApi';
import AppButton from '@/src/components/common/AppButton';
import AppInput from '@/src/components/common/AppInput';
import ScreenWrapper from '@/src/components/common/ScreenWrapper';
import useAuthStore from '@/src/store/authStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * 로그인 페이지
 * TODO: UI 및 로직 구현 필요
 */
export default function LoginScreen() {
  //이메일 , 비밀번호 입력값 상태
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  //로딩 상태 (버튼 중복 클릭 방지)
  const [loading, setLoading] = useState(false);
  //전역 스토어에서 토ㅓ큰 저장 함수, 토스트 메세지 함수 가져오기
  const {setToken,showToast} = useAuthStore()

  const handleLogin = async () => {
    // 입력값 비어있으면 토스트 메시지 표시
    if(!email.trim()) return showToast('이메일을 입력해주세요.')
    if(!password) return showToast('비밀번호를 입력해주세요.')
    
    try{
      setLoading(true)
      
      // 서버에 로그인 요청 (앱은 항상 autoLogin: true → 30일 refresh token 발급)
      const response = await login({memberEmail:email, memberPw: password, autoLogin:true})
      // 응답 헤더에서 access token, refresh token 꺼내기
      const token = response.headers['authorization']?.replace('Bearer ', '');
      const refreshToken = response.headers['refresh-token'];

      if(token){
        // 두 토큰 모두 SecureStore에 저장 후 홈으로 이동
        await setToken(token, refreshToken);
        router.replace('/(tabs)/home')
      }else{
        showToast('로그인에 실패했습니다.')
      }
    }catch{
      showToast('이메일 또는 비밀번호가 올바르지 않습니다.')
    }finally{
      setLoading(false)
    }
  }
  
  return (
    //scroll : 키보드 올라올 때 스크롤 가능하게
    <ScreenWrapper 
      scroll
      style={{paddingHorizontal:30}}
    >
     {/* 상단 타이틀 */}
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#e63946' }}>한우마루</Text>
        <Text style={{ fontSize: 14, color: '#999', marginTop: 8 }}>신선한 한우를 문 앞까지</Text>
      </View>
      
      {/* 이메일 입력창 */}
      <AppInput 
        label="이메일"
        placeholder='이메일을 입력하세요'
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize='none'
      />

      {/* 비밀번호 입력창 : isPassword → 마스킹 + 눈 아이콘 */}
      <AppInput 
        label='비밀번호'
        placeholder='비밀번호를 입력하세요'
        value={password}
        onChangeText={setPassword}
        isPassword
      />

      <View style={{width:'100%', marginBottom:16}}>
        <AppButton
          title='로그인'
          onPress={handleLogin}
          loading={loading}
        />
      </View>

      {/* 회원가입 안내 */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, color: '#999' }}>아직 계정이 없으신가요?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')} style={{ marginLeft: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#e63946' }}>회원가입</Text>
        </TouchableOpacity>
      </View>

    </ScreenWrapper>
  )
}
