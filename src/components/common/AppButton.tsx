import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native'
import React from 'react'
import { Colors } from '@/src/constants/colors'

/**
 * 공통 버튼 컴포넌트
 *
 * @param title    버튼 텍스트
 * @param variant  버튼 스타일 종류
 *                   'primary'  — 레드 배경 (기본값, 주요 액션)
 *                   'outline'  — 테두리만, 배경 투명 (보조 액션)
 *                   'ghost'    — 테두리·배경 없음 (취소, 링크형)
 * @param loading  true이면 텍스트 대신 스피너 표시 + 버튼 비활성화
 * @param disabled 버튼 비활성화
 * @param size     버튼 크기 ('sm' | 'md' | 'lg') — 기본값 'md'
 */
interface AppButtonProps extends PressableProps {
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
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  style: externalStyle,
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
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        { opacity: isDisabled ? 0.5 : state.pressed ? 0.75 : 1 },
        typeof externalStyle === 'function' ? externalStyle(state) : externalStyle,
      ]}
      className={[
        'items-center justify-center',
        sizeClass,
        variantContainerClass,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={variant === 'primary' ? Colors.bgWhite : Colors.primary}
        />
      ) : (
        <Text className={`${variantTextClass} ${textSizeClass}`}>{title}</Text>
      )}
    </Pressable>
  )
}