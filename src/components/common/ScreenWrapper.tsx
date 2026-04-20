import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

/**
 * 공통 화면 래퍼 컴포넌트
 *
 * 모든 화면의 기본 컨테이너로 사용합니다.
 * 아래 세 가지를 한번에 처리합니다:
 *
 * 1. SafeAreaView   — 노치/홈 인디케이터 영역 침범 방지
 * 2. KeyboardAvoidingView — 키보드 올라올 때 화면 밀어 올리기
 * 3. ScrollView (선택) — 내용이 길어질 때 스크롤 허용
 *
 * @param children   화면 내용
 * @param scroll     true이면 ScrollView로 감쌉니다 (기본값 false)
 * @param style      SafeAreaView에 추가할 스타일
 * @param edges      safe area를 적용할 방향 (기본값: 전체)
 *                   헤더가 있는 화면은 ['bottom']만 넘기세요
 *
 * 사용 예시:
 *   // 기본 화면
 *   <ScreenWrapper>
 *     <Text>내용</Text>
 *   </ScreenWrapper>
 *
 *   // 폼 화면 (키보드 + 스크롤)
 *   <ScreenWrapper scroll>
 *     <AppInput ... />
 *     <AppButton ... />
 *   </ScreenWrapper>
 *
 *   // 헤더가 있는 화면 (위쪽 safe area 제외)
 *   <ScreenWrapper edges={['bottom']}>
 *     <Text>내용</Text>
 *   </ScreenWrapper>
 */

interface ScreenWrapperProps {
  children: React.ReactNode
  /** true이면 ScrollView로 감쌉니다 */
  scroll?: boolean
  /** SafeAreaView 추가 스타일 */
  style?: ViewStyle
  /** safe area 적용 방향 - 기본값 전체 */
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
}

export default function ScreenWrapper({
  children,
  scroll = false,
  style,
  edges,
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {/**
       * KeyboardAvoidingView: 키보드가 올라올 때 콘텐츠를 밀어 올립니다.
       * iOS는 'padding', Android는 'height' 방식이 자연스럽습니다.
       */}
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scroll ? (
          /**
           * ScrollView: scroll prop이 true일 때만 사용합니다.
           * keyboardShouldPresistTaps='handled': 스크롤 중 탭으로 키보드 닫힘 방지
           */
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
})