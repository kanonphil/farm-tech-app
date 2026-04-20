import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React from 'react'
import { Colors } from '@/src/constants/colors'

/**
 * 공통 로딩 스피너 컴포넌트
 *
 * API 요청 중이거나 데이터 로딩 중일 때 화면 중앙에 표시합니다.
 *
 * @param size   스피너 크기 ('small' | 'large') — 기본값 'large'
 * @param color  스피너 색상 — 기본값 브랜드 레드
 * @param full   true이면 화면 전체를 차지하는 flex:1 컨테이너로 감쌉니다
 *
 * 사용 예시:
 *   <LoadingSpinner />                         // 기본 (크게, 레드)
 *   <LoadingSpinner size="small" />            // 작게
 *   <LoadingSpinner full />                    // 화면 전체 중앙 정렬
 *   <LoadingSpinner color={Colors.textMuted} /> // 회색 스피너
 */

interface LoadingSpinnerProps {
  /** 스피너 크기 - 기본값 'large' */
  size?: 'small' | 'large'
  /** 스피너 색상 - 기본값 Colors.primary */
  color?: string
  /** true이면 flex:1 + 중앙 정렬 (페이지 전체 로딩용) */
  full?: boolean
}

export default function LoadingSpinner({
  size = 'large',
  color = Colors.primary,
  full = false,
}: LoadingSpinnerProps) {
  if (full) {
    return (
      <View className='flex-1 items-center justifyi-center bg-[#f9f9f9]'>
        <ActivityIndicator size={size} color={color} />
      </View>
    )
  }
  return <ActivityIndicator size={size} color={color} />
}

const styles = StyleSheet.create({})