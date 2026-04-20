import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/src/constants/colors'
import { Ionicons } from '@expo/vector-icons'

/**
 * 공통 텍스트 입력 컴포넌트
 *
 * React Native의 TextInput을 감싸서 한우마루 디자인을 일관되게 적용합니다.
 * TextInputProps를 그대로 전달받으므로 placeholder, onChangeText 등 모두 사용 가능합니다.
 *
 * @param label        입력창 위에 표시할 라벨 텍스트
 * @param error        에러 메시지 — 입력창 아래 빨간 텍스트로 표시
 * @param isPassword   true이면 비밀번호 마스킹 + 눈 아이콘 토글 버튼 표시
 *
 * 사용 예시:
 *   <AppInput
 *     label="이메일"
 *     placeholder="이메일을 입력하세요"
 *     value={email}
 *     onChangeText={setEmail}
 *     keyboardType="email-address"
 *   />
 *   <AppInput
 *     label="비밀번호"
 *     isPassword
 *     value={password}
 *     onChangeText={setPassword}
 *     error={errors.password}
 *   />
 */

interface AppInputProps extends TextInputProps {
  /** 입력창 위 라벨 */
  label?: string
  /** 유효성 에러 메시지 */
  error?: string
  /** 비밀번호 입력 여부 - 마스킹 + 눈 아이콘 */
  isPassword?: boolean
}

export default function AppInput({
  label,
  error,
  isPassword = false,
  ...props
}: AppInputProps) {
  /** 비밀번호 표시/숨김 토글 상태 */
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <View className='mb-4'>
      {/* 라벨 */}
      {label && (
        <Text className='mb-1 text-sm font-medium text-[#555]'>{label}</Text>
      )}

      {/* 입력창 + 눈 아이콘 래퍼 */}
      <View
        className={[
          'flex-row items-center',
          'rounded-lg border bg-white px-4',
          error ? 'border-[#e53935]' : 'border-[#ddd]',
        ].join(' ')}
      >
        <TextInput 
          className='flex-1 py-3 text-base text-[#1a1a1a]'
          placeholderTextColor={Colors.textMuted}
          // 비밀번호 모드일 때: showPassword가 false면 마스킹
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {/* 비밀번호 모드일 때만 눈 아이콘 표시 */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 에러 메시지 */}
      {error && (
        <Text className='mt-1 text-xs text-[#e53935]'>{error}</Text>
      )}
    </View>
  )
}
