import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, } from 'react-native'
import React from 'react'
import { Colors } from '@/src/constants/colors'

/**
 * 공통 버튼 컴포넌트
 *
 * 한우마루 앱 전체에서 사용하는 버튼입니다.
 * variant로 스타일을 선택하고, loading 상태도 지원합니다.
 *
 * @param title    버튼 텍스트
 * @param variant  버튼 스타일 종류
 *                   'primary'  — 레드 배경 (기본값, 주요 액션)
 *                   'outline'  — 테두리만, 배경 투명 (보조 액션)
 *                   'ghost'    — 테두리·배경 없음 (취소, 링크형)
 * @param loading  true이면 텍스트 대신 스피너 표시 + 버튼 비활성화
 * @param disabled 버튼 비활성화
 * @param size     버튼 크기 ('sm' | 'md' | 'lg') — 기본값 'md'
 *
 * 사용 예시:
 *   <AppButton title="로그인" onPress={handleLogin} />
 *   <AppButton title="취소" variant="outline" onPress={handleCancel} />
 *   <AppButton title="저장 중..." loading />
 *   <AppButton title="작은 버튼" size="sm" variant="ghost" />
 */

interface AppButtonProps extends TouchableOpacityProps {
  /** 버튼 텍스트 */
  title: string
  /** 버튼 스타일 - 기본값 'primary' */
  variant?: 'primary' | 'outline' | 'ghost'
  /** 로딩 중 여부 - true이면 스피너 표시 */
  loading?: boolean
  /** 버튼 크기 - 기본값 'md' */
  size?: 'sm' | 'md' | 'lg'
}

export default function AppButton({
  title,
  variant='primary',
  loading=false,
  disabled=false,
  size='md',
  ...props
}: AppButtonProps) {

  // ── 크기별 클래스 ──────────────────────────────────────
  const sizeClass = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  }[size]

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  // ── variant별 스타일 ───────────────────────────────────
  const variantContainerClass = {
    primary: 'bg-[#e63946] rounded-lg',
    outline: 'border border-[#e63946] rounded-lg bg-transparent',
    ghost:   'bg-transparent',
  }[variant]

  const variantTextClass = {
    primary: 'text-white font-semibold',
    outline: 'text-[#e63946] font-semibold',
    ghost:   'text-[#e63946]',
  }[variant]

  /** 비활성 또는 로딩 중 투명도 */
  const isDisabled = disabled || loading
  
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={[
        'items-center justify-center',
        sizeClass,
        variantContainerClass,
        isDisabled ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      {...props}
    >
      {loading ? (
        // 로딩 중: 스피너 표시
        <ActivityIndicator 
          size='small'
          color={variant === 'primary' ? Colors.bgWhite : Colors.primary}
        />
      ) : (
        // 기본: 텍스트 표시
        <Text className={`${variantTextClass} ${textSizeClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
