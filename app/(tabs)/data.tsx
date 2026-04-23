import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

/**
 * 데이터 확인 탭 (app/(tabs)/data.tsx)
 *
 * MANAGER 전용 — 기간별 센서 이력 데이터를 조회합니다.
 * 백엔드 /sensors/history?start=&end= 엔드포인트를 사용합니다.
 *
 * 가드 전략: useRequireAuth() + MANAGER role useEffect
 */

type SensorTab = 'temp' | 'light' | 'air'

const SENSOR_TABS: {
  key: SensorTab
  label: string
  icon: keyof typeof Ionicons.glyphMap
}[] = [
  { key: 'temp',  label: '온·습도', icon: 'thermometer-outline' },
  { key: 'light', label: '조도',    icon: 'sunny-outline'       },
  { key: 'air',   label: '대기질',  icon: 'leaf-outline'        },
]

export default function DataScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((state) => state.role)
  const [activeTab, setActiveTab] = useState<SensorTab>('temp')

  /**
   * MANAGER 역할 검증
   * 로그인은 됐지만 MANAGER가 아니면 홈 탭으로 이동합니다.
   */
  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') {
      router.replace('/(tabs)/home' as any)
    }
  }, [isReady, isLoggedIn, role])

  // 토큰 복원 중 / 비로그인 / 비매니저 → 스피너 표시
  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />

  return (
    <ScreenWrapper scroll>

      {/* ── 헤더 ────────────────────────────────── */}
      <View className='px-5 pt-5 pb-4'>
        <Text className='text-2xl font-bold text-gray-900'>데이터 확인</Text>
        <Text className='text-sm text-gray-400 mt-1'>기간별 센서 이력 조회</Text>
      </View>

      {/* ── 날짜 범위 선택 ───────────────────────── */}
      <View className='px-5 mb-6'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          조회 기간
        </Text>

        <View className='bg-white rounded-2xl border border-gray-100 p-4'>
          {/* 날짜 입력 행 */}
          <View className='flex-row items-center gap-3 mb-3'>
            <Pressable className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200'>
              <Text className='text-xs text-gray-400 mb-1'>시작일</Text>
              <Text className='text-sm font-medium text-gray-500'>날짜 선택</Text>
            </Pressable>

            <Ionicons name='arrow-forward' size={16} color='#9ca3af' />

            <Pressable className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200'>
              <Text className='text-xs text-gray-400 mb-1'>종료일</Text>
              <Text className='text-sm font-medium text-gray-500'>날짜 선택</Text>
            </Pressable>
          </View>

          {/* 조회 버튼 */}
          <Pressable className='bg-primary py-3 rounded-xl items-center'>
            <Text className='text-sm font-semibold text-white'>조회하기</Text>
          </Pressable>
        </View>
      </View>

      {/* ── 센서 탭 ─────────────────────────────── */}
      <View className='px-5 mb-4'>
        <View className='flex-row bg-gray-100 rounded-2xl p-1 gap-1'>
          {SENSOR_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 flex-row items-center justify-center gap-1 py-2.5 rounded-xl ${
                activeTab === tab.key ? 'bg-white' : ''
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={activeTab === tab.key ? '#e63946' : '#9ca3af'}
              />
              <Text className={`text-xs font-semibold ${
                activeTab === tab.key ? 'text-primary' : 'text-gray-400'
              }`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── 데이터 영역 ─────────────────────────── */}
      <View className='px-5 pb-8'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          측정 이력
        </Text>

        {/* TODO: 차트 또는 테이블 */}
        <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center justify-center'>
          <Ionicons name='bar-chart-outline' size={40} color='#d1d5db' />
          <Text className='text-sm text-gray-400 mt-3 text-center'>
            기간을 선택하고 조회하기를 눌러주세요
          </Text>
        </View>
      </View>

    </ScreenWrapper>
  )
}