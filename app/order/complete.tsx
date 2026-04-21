import AppButton from '@/src/components/common/AppButton'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

/**
 * 주문 완료 화면
 *
 * 진입 경로:
 *   checkout.tsx → router.push('/order/complete?tossOrderId=ORDER_XXX')
 *
 * 주의:
 *   이 화면에서 뒤로가기 시 결제 화면으로 돌아가면 안 됩니다.
 *   버튼에 router.replace()를 쓰는 이유 — 스택에서 checkout/complete를 제거하고
 *   홈 또는 마이페이지로 완전히 이동하기 위해서입니다.
 */
export default function CompleteScreen() {
  // 주문 ID - 추후 주문 상세 조회나 Toss 결제 연동에 사용
  const { tossOrderId } = useLocalSearchParams<{ tossOrderId: string }>()
  
  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center px-6">

        {/* ── 성공 아이콘 ──────────────────────── */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#e8f5e9]">
          <Ionicons name="checkmark-circle" size={56} color="#4caf50" />
        </View>

        {/* ── 타이틀 ───────────────────────────── */}
        <Text className="text-2xl font-bold text-[#1a1a1a]">주문 완료!</Text>
        <Text className="mt-2 text-center text-sm text-[#888]">
          주문이 성공적으로 접수되었습니다.{'\n'}
          빠르게 배송해 드릴게요 🐄
        </Text>

        {/* ── 주문 번호 ─────────────────────────── */}
        {tossOrderId && (
          <View className="mt-6 w-full rounded-xl bg-[#f9f9f9] px-4 py-3">
            <Text className="text-center text-xs text-[#aaa]">주문 번호</Text>
            <Text
              className="mt-1 text-center text-sm font-medium text-[#555]"
              numberOfLines={1}
            >
              {tossOrderId}
            </Text>
          </View>
        )}

        {/* ── 버튼 영역 ─────────────────────────── */}
        <View className="mt-10 w-full gap-y-3">

          {/**
           * 홈으로: replace로 이동 — 뒤로가기 시 완료/결제 화면으로 돌아오지 않도록
           * 주문 완료 후 다시 결제 화면으로 돌아가는 건 의미 없기 때문
           */}
          <AppButton
            title="홈으로"
            onPress={() => router.replace('/(tabs)/home')}
            size="lg"
          />

          {/**
           * 주문내역: 현재는 마이페이지로 이동
           * 추후 주문내역 화면(mypage/orders) 구현 후 경로 변경
           */}
          <AppButton
            title="주문내역 보기"
            onPress={() => router.replace('/(tabs)/mypage')}
            size="lg"
            variant="outline"
          />

        </View>

      </View>
    </ScreenWrapper>
  )
}
