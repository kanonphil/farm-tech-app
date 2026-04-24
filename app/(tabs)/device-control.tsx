import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import {
  getIoTStatus, setMode,
  ledOn, ledOff, fanOn, fanOff, buzzerOn, buzzerOff,
} from '@/src/api/iotApi'
import { getActivePreset, ThresholdPreset } from '@/src/api/thresholdApi'

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

type Mode = 'auto' | 'manual'

interface ActuatorState {
  on: boolean
  /** LED/팬: 0~100(%), 부저: Hz */
  value: number
}

// ─────────────────────────────────────────────
// 스텝퍼 컴포넌트
// ─────────────────────────────────────────────

interface StepperProps {
  label: string
  displayValue: string
  disabled: boolean
  canDecrease: boolean
  canIncrease: boolean
  onDecrease: () => void
  onIncrease: () => void
}

/**
 * ± 버튼으로 값을 조절하는 스텝퍼
 * Slider 패키지 없이 동일한 UX 제공
 */
function Stepper({ label, displayValue, disabled, canDecrease, canIncrease, onDecrease, onIncrease }: StepperProps) {
  return (
    <View className='flex-row items-center justify-between mt-2 bg-gray-50 rounded-xl px-3 py-2.5'>
      <Text className='text-xs text-gray-400'>{label}</Text>
      <View className='flex-row items-center gap-3'>
        <Pressable
          onPress={onDecrease}
          disabled={disabled || !canDecrease}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            disabled || !canDecrease ? 'bg-gray-100' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-lg font-bold leading-none ${
            disabled || !canDecrease ? 'text-gray-300' : 'text-gray-600'
          }`}>−</Text>
        </Pressable>
        <Text className='text-sm font-semibold text-gray-700 w-16 text-center'>{displayValue}</Text>
        <Pressable
          onPress={onIncrease}
          disabled={disabled || !canIncrease}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            disabled || !canIncrease ? 'bg-gray-100' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-lg font-bold leading-none ${
            disabled || !canIncrease ? 'text-gray-300' : 'text-gray-600'
          }`}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────
// 액추에이터 카드
// ─────────────────────────────────────────────

interface ActuatorCardProps {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  iconBg: string
  isOn: boolean
  disabled: boolean
  submitting: boolean
  stepperLabel: string
  stepperDisplayValue: string
  canDecrease: boolean
  canIncrease: boolean
  onPressOn: () => void
  onPressOff: () => void
  onDecrease: () => void
  onIncrease: () => void
}

/**
 * 액추에이터 제어 카드
 * ON/OFF 버튼 + 값 스텝퍼 포함
 */
function ActuatorCard({
  label, icon, iconColor, iconBg,
  isOn, disabled, submitting,
  stepperLabel, stepperDisplayValue, canDecrease, canIncrease,
  onPressOn, onPressOff, onDecrease, onIncrease,
}: ActuatorCardProps) {
  return (
    <View className='bg-white rounded-2xl border border-gray-100 p-4 mb-3'>
      {/* 상단: 아이콘 + 이름 + ON/OFF 뱃지 */}
      <View className='flex-row items-center justify-between mb-2'>
        <View className='flex-row items-center gap-3'>
          <View className={`${iconBg} w-10 h-10 rounded-full items-center justify-center`}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <Text className='text-sm font-semibold text-gray-900'>{label}</Text>
        </View>
        {submitting ? (
          <ActivityIndicator size='small' color='#9ca3af' />
        ) : (
          <View className={`px-3 py-1 rounded-full ${isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs font-semibold ${isOn ? 'text-green-600' : 'text-gray-400'}`}>
              {isOn ? 'ON' : 'OFF'}
            </Text>
          </View>
        )}
      </View>

      {/* 스텝퍼 */}
      <Stepper
        label={stepperLabel}
        displayValue={stepperDisplayValue}
        disabled={disabled}
        canDecrease={canDecrease}
        canIncrease={canIncrease}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
      />

      {/* 켜기 / 끄기 버튼 */}
      <View className='flex-row gap-2 mt-3'>
        <Pressable
          onPress={onPressOn}
          disabled={disabled || submitting}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            disabled || submitting ? 'bg-gray-100' : isOn ? 'bg-primary' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm font-semibold ${
            disabled || submitting ? 'text-gray-300' : isOn ? 'text-white' : 'text-gray-500'
          }`}>켜기</Text>
        </Pressable>
        <Pressable
          onPress={onPressOff}
          disabled={disabled || submitting}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            disabled || submitting ? 'bg-gray-100' : !isOn ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm font-semibold ${
            disabled || submitting ? 'text-gray-300' : !isOn ? 'text-white' : 'text-gray-500'
          }`}>끄기</Text>
        </Pressable>
      </View>

      {disabled && (
        <Text className='text-xs text-gray-400 text-center mt-2'>
          수동 모드에서만 제어할 수 있습니다
        </Text>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────
// 메인 화면
// ─────────────────────────────────────────────

export default function DeviceControlScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((state) => state.role)
  const { showToast, showAlert } = useAuthStore()

  const [mode, setModeState] = useState<Mode>('auto')
  const [led,    setLed]    = useState<ActuatorState>({ on: false, value: 100 })
  const [fan,    setFan]    = useState<ActuatorState>({ on: false, value: 100 })
  const [buzzer, setBuzzer] = useState<ActuatorState>({ on: false, value: 440 })
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activePreset, setActivePreset] = useState<ThresholdPreset | null>(null)

  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') {
      router.replace('/(tabs)/home' as any)
    }
  }, [isReady, isLoggedIn, role])

  // ── 초기 상태 로드 ─────────────────────────────
  const loadInitialState = useCallback(async () => {
    setLoading(true)
    try {
      const [iotStatus, preset] = await Promise.all([
        getIoTStatus(),
        getActivePreset().catch(() => null), // 프리셋 없어도 화면 진입 허용
      ])

      // LIVE 상태일 때만 실제 액추에이터 값 동기화
      if (iotStatus.source === 'LIVE') {
        setModeState((iotStatus.mode ?? 'auto') as Mode)
        setLed({
          on:    iotStatus.ledOn ?? false,
          value: Math.round((iotStatus.ledBrightness ?? 1.0) * 100),
        })
        setFan({
          on:    iotStatus.fanOn ?? false,
          value: Math.round((iotStatus.fanSpeed ?? 1.0) * 100),
        })
        setBuzzer({
          on:    iotStatus.buzzerOn ?? false,
          value: iotStatus.buzzerFreq ?? 440,
        })
      }
      setActivePreset(preset)
    } catch {
      showToast('기기 상태를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useFocusEffect(
    useCallback(() => {
      if (isReady && isLoggedIn && role === 'MANAGER') loadInitialState()
    }, [isReady, isLoggedIn, role, loadInitialState])
  )

  // ── 모드 전환 ──────────────────────────────────
  const handleModeChange = useCallback(async (newMode: Mode) => {
    if (newMode === mode) return
    setSubmitting(true)
    try {
      await setMode(newMode)
      setModeState(newMode)
    } catch {
      showToast('모드 전환에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }, [mode, showToast])

  // ── LED ────────────────────────────────────────
  const handleLedOn = useCallback(async () => {
    setSubmitting(true)
    try {
      await ledOn(led.value / 100)
      setLed(p => ({ ...p, on: true }))
    } catch { showToast('LED 켜기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [led.value, showToast])

  const handleLedOff = useCallback(async () => {
    setSubmitting(true)
    try {
      await ledOff()
      setLed(p => ({ ...p, on: false }))
    } catch { showToast('LED 끄기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [showToast])

  // ── 환풍기 ─────────────────────────────────────
  const handleFanOn = useCallback(async () => {
    setSubmitting(true)
    try {
      await fanOn(fan.value / 100)
      setFan(p => ({ ...p, on: true }))
    } catch { showToast('환풍기 켜기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [fan.value, showToast])

  const handleFanOff = useCallback(async () => {
    setSubmitting(true)
    try {
      await fanOff()
      setFan(p => ({ ...p, on: false }))
    } catch { showToast('환풍기 끄기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [showToast])

  // ── 부저 ───────────────────────────────────────
  const handleBuzzerOn = useCallback(async () => {
    setSubmitting(true)
    try {
      await buzzerOn(buzzer.value)
      setBuzzer(p => ({ ...p, on: true }))
    } catch { showToast('부저 켜기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [buzzer.value, showToast])

  const handleBuzzerOff = useCallback(async () => {
    setSubmitting(true)
    try {
      await buzzerOff()
      setBuzzer(p => ({ ...p, on: false }))
    } catch { showToast('부저 끄기에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [showToast])

  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />
  if (loading) return <LoadingSpinner full />

  const isManual = mode === 'manual'

  return (
    <ScreenWrapper scroll>
      <View className='px-5 pt-5 pb-4'>
        <Text className='text-2xl font-bold text-gray-900'>기기제어</Text>
        <Text className='text-sm text-gray-400 mt-1'>LED · 환풍기 · 부저 제어</Text>
      </View>

      {/* 모드 토글 */}
      <View className='px-5 mb-5'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>제어 모드</Text>
        <View className='flex-row bg-gray-100 rounded-2xl p-1'>
          {([
            { key: 'auto',   label: '자동', desc: '임계값 기준 자동 제어', icon: 'flash-outline'     },
            { key: 'manual', label: '수동', desc: '직접 ON / OFF 제어',   icon: 'hand-left-outline' },
          ] as const).map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleModeChange(item.key)}
              disabled={submitting}
              className={`flex-1 py-3 rounded-xl items-center ${mode === item.key ? 'bg-white' : ''}`}
            >
              <View className='flex-row items-center gap-1'>
                <Ionicons name={item.icon} size={15} color={mode === item.key ? '#e63946' : '#9ca3af'} />
                <Text className={`text-sm font-semibold ${mode === item.key ? 'text-primary' : 'text-gray-400'}`}>
                  {item.label}
                </Text>
              </View>
              <Text className={`text-xs mt-0.5 ${mode === item.key ? 'text-gray-500' : 'text-gray-300'}`}>
                {item.desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 액추에이터 카드 */}
      <View className='px-5'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>장치</Text>

        <ActuatorCard
          label='LED 조명' icon='bulb-outline' iconColor='#eab308' iconBg='bg-yellow-100'
          isOn={led.on} disabled={!isManual} submitting={submitting}
          stepperLabel='밝기' stepperDisplayValue={`${led.value}%`}
          canDecrease={led.value > 10} canIncrease={led.value < 100}
          onPressOn={handleLedOn} onPressOff={handleLedOff}
          onDecrease={() => setLed(p => ({ ...p, value: Math.max(10,  p.value - 10) }))}
          onIncrease={() => setLed(p => ({ ...p, value: Math.min(100, p.value + 10) }))}
        />
        <ActuatorCard
          label='환풍기' icon='aperture-outline' iconColor='#3b82f6' iconBg='bg-blue-100'
          isOn={fan.on} disabled={!isManual} submitting={submitting}
          stepperLabel='속도' stepperDisplayValue={`${fan.value}%`}
          canDecrease={fan.value > 10} canIncrease={fan.value < 100}
          onPressOn={handleFanOn} onPressOff={handleFanOff}
          onDecrease={() => setFan(p => ({ ...p, value: Math.max(10,  p.value - 10) }))}
          onIncrease={() => setFan(p => ({ ...p, value: Math.min(100, p.value + 10) }))}
        />
        <ActuatorCard
          label='부저' icon='volume-high-outline' iconColor='#a855f7' iconBg='bg-purple-100'
          isOn={buzzer.on} disabled={!isManual} submitting={submitting}
          stepperLabel='주파수' stepperDisplayValue={`${buzzer.value} Hz`}
          canDecrease={buzzer.value > 200} canIncrease={buzzer.value < 2000}
          onPressOn={handleBuzzerOn} onPressOff={handleBuzzerOff}
          onDecrease={() => setBuzzer(p => ({ ...p, value: Math.max(200,  p.value - 100) }))}
          onIncrease={() => setBuzzer(p => ({ ...p, value: Math.min(2000, p.value + 100) }))}
        />
      </View>

      {/* 임계값 섹션 */}
      <View className='px-5 mt-5 pb-8'>
        <View className='flex-row items-center justify-between mb-3'>
          <Text className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>임계값 설정</Text>
          <Pressable
            onPress={() => router.push('/manager/threshold' as any)}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text className='text-xs text-primary'>관리 ›</Text>
          </Pressable>
        </View>

        <View className='bg-white rounded-2xl border border-gray-100 p-4'>
          {activePreset ? (
            <>
              <View className='flex-row items-center gap-2 mb-3'>
                <View className='w-2 h-2 rounded-full bg-green-500' />
                <Text className='text-sm font-semibold text-gray-800'>{activePreset.name}</Text>
                <Text className='text-xs text-green-500'>활성</Text>
              </View>
              <View className='gap-y-2'>
                <View className='flex-row gap-2'>
                  <View className='flex-1 bg-amber-50 rounded-xl p-3'>
                    <Text className='text-xs text-gray-400 mb-1'>온도</Text>
                    <Text className='text-sm font-semibold text-gray-800'>{activePreset.tempLow} ~ {activePreset.tempHigh} °C</Text>
                  </View>
                  <View className='flex-1 bg-blue-50 rounded-xl p-3'>
                    <Text className='text-xs text-gray-400 mb-1'>습도</Text>
                    <Text className='text-sm font-semibold text-gray-800'>{activePreset.humLow} ~ {activePreset.humHigh} %</Text>
                  </View>
                </View>
                <View className='flex-row gap-2'>
                  <View className='flex-1 bg-yellow-50 rounded-xl p-3'>
                    <Text className='text-xs text-gray-400 mb-1'>조도</Text>
                    <Text className='text-sm font-semibold text-gray-800'>{activePreset.luxLow} ~ {activePreset.luxHigh} lux</Text>
                  </View>
                  <View className='flex-1 bg-green-50 rounded-xl p-3'>
                    <Text className='text-xs text-gray-400 mb-1'>대기질</Text>
                    <Text className='text-sm font-semibold text-gray-800'>주의 {activePreset.airPpmLow} / 위험 {activePreset.airPpmBad}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View className='items-center py-4'>
              <Ionicons name='settings-outline' size={28} color='#d1d5db' />
              <Text className='text-sm text-gray-400 mt-2'>활성 프리셋이 없습니다</Text>
              <Pressable
                onPress={() => router.push('/manager/threshold' as any)}
                className='mt-3 px-4 py-2 bg-primary rounded-xl'
              >
                <Text className='text-xs font-semibold text-white'>설정하러 가기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ScreenWrapper>
  )
}