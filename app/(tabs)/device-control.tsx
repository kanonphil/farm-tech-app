import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

/**
 * 기기제어 탭 (app/(tabs)/device-control.tsx)
 *
 * MANAGER 전용 — LED, 환풍기, 부저를 수동으로 제어합니다.
 * 백엔드 /api/actuator/** 엔드포인트를 사용합니다.
 *
 * 가드 전략: useRequireAuth() + MANAGER role useEffect
 */

type Mode = 'auto' | 'manual'

// ── 액추에이터 카드 ────────────────────────────────────────────

interface ActuatorCardProps {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  iconBg: string
  isOn: boolean
  subInfo: string
  disabled: boolean
  onPressOn: () => void
  onPressOff: () => void
}

/**
 * 개별 액추에이터 제어 카드
 */
function ActuatorCard({
  label, icon, iconColor, iconBg,
  isOn, subInfo, disabled, onPressOn, onPressOff,
}: ActuatorCardProps) {
  return (
    <View className='bg-white rounded-2xl border border-gray-100 p-4 mb-3'>
      {/* 상단: 아이콘 + 이름 + 상태 뱃지 */}
      <View className='flex-row items-center justify-between mb-4'>
        <View className='flex-row items-center gap-3'>
          <View className={`${iconBg} w-10 h-10 rounded-full items-center justify-center`}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View>
            <Text className='text-sm font-semibold text-gray-900'>{label}</Text>
            <Text className='text-xs text-gray-400'>{subInfo}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-semibold ${isOn ? 'text-green-600' : 'text-gray-400'}`}>
            {isOn ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      {/* 켜기 / 끄기 버튼 */}
      <View className='flex-row gap-2'>
        <Pressable
          onPress={onPressOn}
          disabled={disabled}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            disabled ? 'bg-gray-100' : isOn ? 'bg-primary' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm font-semibold ${
            disabled ? 'text-gray-300' : isOn ? 'text-white' : 'text-gray-500'
          }`}>
            켜기
          </Text>
        </Pressable>
        <Pressable
          onPress={onPressOff}
          disabled={disabled}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            disabled ? 'bg-gray-100' : !isOn ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm font-semibold ${
            disabled ? 'text-gray-300' : !isOn ? 'text-white' : 'text-gray-500'
          }`}>
            끄기
          </Text>
        </Pressable>
      </View>

      {/* 수동 모드가 아닐 때 안내 문구 */}
      {disabled && (
        <Text className='text-xs text-gray-400 text-center mt-2'>
          수동 모드에서만 제어할 수 있습니다
        </Text>
      )}
    </View>
  )
}

// ── 메인 화면 ─────────────────────────────────────────────────

export default function DeviceControlScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((state) => state.role)
  const [mode, setMode] = useState<Mode>('auto')

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

  const isManual = mode === 'manual'

  return (
    <ScreenWrapper scroll>

      {/* ── 헤더 ────────────────────────────────── */}
      <View className='px-5 pt-5 pb-4'>
        <Text className='text-2xl font-bold text-gray-900'>기기제어</Text>
        <Text className='text-sm text-gray-400 mt-1'>LED · 환풍기 · 부저 제어</Text>
      </View>

      {/* ── 모드 토글 ────────────────────────────── */}
      <View className='px-5 mb-6'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          제어 모드
        </Text>

        <View className='flex-row bg-gray-100 rounded-2xl p-1'>
          {([
            { key: 'auto',   label: '자동', desc: '임계값 기준 자동 제어', icon: 'flash-outline'     },
            { key: 'manual', label: '수동', desc: '직접 ON / OFF 제어',   icon: 'hand-left-outline' },
          ] as const).map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setMode(item.key)}
              className={`flex-1 py-3 rounded-xl items-center ${
                mode === item.key ? 'bg-white' : ''
              }`}
            >
              <View className='flex-row items-center gap-1'>
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={mode === item.key ? '#e63946' : '#9ca3af'}
                />
                <Text className={`text-sm font-semibold ${
                  mode === item.key ? 'text-primary' : 'text-gray-400'
                }`}>
                  {item.label}
                </Text>
              </View>
              <Text className={`text-xs mt-0.5 ${
                mode === item.key ? 'text-gray-500' : 'text-gray-300'
              }`}>
                {item.desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── 액추에이터 카드 ──────────────────────── */}
      <View className='px-5 pb-8'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          장치
        </Text>

        <ActuatorCard
          label='LED 조명'
          icon='bulb-outline'
          iconColor='#eab308'
          iconBg='bg-yellow-100'
          isOn={false}
          subInfo='밝기 --'
          disabled={!isManual}
          onPressOn={() => { /* TODO: POST /api/actuator/led/on */ }}
          onPressOff={() => { /* TODO: POST /api/actuator/led/off */ }}
        />
        <ActuatorCard
          label='환풍기'
          icon='aperture-outline'
          iconColor='#3b82f6'
          iconBg='bg-blue-100'
          isOn={false}
          subInfo='속도 --'
          disabled={!isManual}
          onPressOn={() => { /* TODO: POST /api/actuator/fan/on */ }}
          onPressOff={() => { /* TODO: POST /api/actuator/fan/off */ }}
        />
        <ActuatorCard
          label='부저'
          icon='volume-high-outline'
          iconColor='#a855f7'
          iconBg='bg-purple-100'
          isOn={false}
          subInfo='-- Hz'
          disabled={!isManual}
          onPressOn={() => { /* TODO: POST /api/actuator/buzzer/on */ }}
          onPressOff={() => { /* TODO: POST /api/actuator/buzzer/off */ }}
        />
      </View>

    </ScreenWrapper>
  )
}