import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getSensorHistory, SensorHistory, SensorRecord } from '@/src/api/iotApi'

type SensorTab = 'temp' | 'light' | 'air'

const SENSOR_TABS: { key: SensorTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'temp',  label: '온·습도', icon: 'thermometer-outline' },
  { key: 'light', label: '조도',    icon: 'sunny-outline'       },
  { key: 'air',   label: '대기질',  icon: 'leaf-outline'        },
]

/** Date → 'yyyy-MM-dd' */
function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** ISO 문자열 → 'MM.dd HH:mm' */
function fmtTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function DataScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((s) => s.role)
  const { showToast } = useAuthStore()

  const today   = new Date()
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7)

  const [startDate, setStartDate] = useState<Date>(weekAgo)
  const [endDate,   setEndDate]   = useState<Date>(today)
  const [showStart, setShowStart] = useState(false)
  const [showEnd,   setShowEnd]   = useState(false)

  const [historyData, setHistoryData] = useState<SensorHistory | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [activeTab,   setActiveTab]   = useState<SensorTab>('temp')

  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') {
      router.replace('/(tabs)/home' as any)
    }
  }, [isReady, isLoggedIn, role])

  const handleFetch = useCallback(async () => {
    if (startDate > endDate) {
      showToast('시작일이 종료일보다 늦을 수 없습니다.')
      return
    }
    setLoading(true)
    try {
      const data = await getSensorHistory(toDateStr(startDate), toDateStr(endDate))
      setHistoryData(data)
    } catch {
      showToast('데이터 조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, showToast])

  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />

  const records: SensorRecord[] =
    historyData
      ? activeTab === 'temp'  ? historyData.dht
      : activeTab === 'light' ? historyData.light
      :                         historyData.air
      : []

  return (
    <ScreenWrapper scroll>
      <View className='px-5 pt-5 pb-4'>
        <Text className='text-2xl font-bold text-gray-900'>데이터 확인</Text>
        <Text className='text-sm text-gray-400 mt-1'>기간별 센서 이력 조회</Text>
      </View>

      {/* 날짜 선택 */}
      <View className='px-5 mb-5'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>조회 기간</Text>
        <View className='bg-white rounded-2xl border border-gray-100 p-4'>
          <View className='flex-row items-center gap-3 mb-3'>
            <Pressable
              onPress={() => setShowStart(true)}
              className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200'
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text className='text-xs text-gray-400 mb-1'>시작일</Text>
              <Text className='text-sm font-semibold text-gray-700'>{toDateStr(startDate)}</Text>
            </Pressable>
            <Ionicons name='arrow-forward' size={16} color='#9ca3af' />
            <Pressable
              onPress={() => setShowEnd(true)}
              className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200'
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text className='text-xs text-gray-400 mb-1'>종료일</Text>
              <Text className='text-sm font-semibold text-gray-700'>{toDateStr(endDate)}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleFetch}
            disabled={loading}
            className='bg-primary py-3 rounded-xl items-center'
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            {loading
              ? <ActivityIndicator size='small' color='#fff' />
              : <Text className='text-sm font-semibold text-white'>조회하기</Text>
            }
          </Pressable>
        </View>

        {showStart && (
          <DateTimePicker
            mode='date' value={startDate} maximumDate={endDate}
            onChange={(_, d) => { setShowStart(false); if (d) setStartDate(d) }}
          />
        )}
        {showEnd && (
          <DateTimePicker
            mode='date' value={endDate} minimumDate={startDate} maximumDate={new Date()}
            onChange={(_, d) => { setShowEnd(false); if (d) setEndDate(d) }}
          />
        )}
      </View>

      {/* 센서 탭 */}
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
              <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? '#e63946' : '#9ca3af'} />
              <Text className={`text-xs font-semibold ${activeTab === tab.key ? 'text-primary' : 'text-gray-400'}`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 데이터 영역 */}
      <View className='px-5 pb-8'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          측정 이력{records.length > 0 ? ` (${records.length}건)` : ''}
        </Text>

        {!historyData ? (
          <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
            <Ionicons name='bar-chart-outline' size={40} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-3 text-center'>기간을 선택하고 조회하기를 눌러주세요</Text>
          </View>
        ) : records.length === 0 ? (
          <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
            <Ionicons name='document-outline' size={40} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-3'>해당 기간에 데이터가 없습니다</Text>
          </View>
        ) : (
          <View className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
            {/* 헤더 */}
            <View className='flex-row bg-gray-50 px-4 py-2 border-b border-gray-100'>
              <Text className='text-xs font-semibold text-gray-400 w-28'>시간</Text>
              {activeTab === 'temp'  && <><Text className='text-xs font-semibold text-gray-400 flex-1 text-right'>온도 (°C)</Text><Text className='text-xs font-semibold text-gray-400 flex-1 text-right'>습도 (%)</Text></>}
              {activeTab === 'light' && <Text className='text-xs font-semibold text-gray-400 flex-1 text-right'>조도 (lux)</Text>}
              {activeTab === 'air'   && <Text className='text-xs font-semibold text-gray-400 flex-1 text-right'>대기질 (raw)</Text>}
            </View>
            {records.map((rec, idx) => (
              <View
                key={idx}
                className={`flex-row px-4 py-3 items-center ${idx < records.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <Text className='text-xs text-gray-400 w-28'>{fmtTime(rec.recordedAt)}</Text>
                {activeTab === 'temp'  && <><Text className='text-sm font-medium text-gray-800 flex-1 text-right'>{rec.temperature.toFixed(1)}</Text><Text className='text-sm font-medium text-gray-800 flex-1 text-right'>{rec.humidity.toFixed(1)}</Text></>}
                {activeTab === 'light' && <Text className='text-sm font-medium text-gray-800 flex-1 text-right'>{rec.lightValue.toFixed(0)}</Text>}
                {activeTab === 'air'   && <Text className='text-sm font-medium text-gray-800 flex-1 text-right'>{rec.rawValue}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScreenWrapper>
  )
}