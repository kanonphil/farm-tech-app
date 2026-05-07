import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View, Dimensions } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getSensorHistory, SensorHistory, SensorRecord } from '@/src/api/iotApi'
import { LineChart } from 'react-native-gifted-charts'

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────

type SensorTab  = 'all' | 'temp' | 'humidity' | 'light' | 'air'
type RangeType  = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

/** 웹 sensorAggregate.js와 동일한 포인트 구조 */
type ChartData = {
  time:  string
  value: number
  max:   number
  min:   number
}

// ────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width
const CHART_WIDTH  = SCREEN_WIDTH - 117

const SENSOR_TABS: {
  key:   SensorTab
  label: string
  icon:  keyof typeof Ionicons.glyphMap
  color: string
  unit:  string
}[] = [
  { key: 'all',      label: '전체',   icon: 'grid-outline',        color: '#1a1a1a', unit: ''     },
  { key: 'temp',     label: '온도',   icon: 'thermometer-outline', color: '#ef4444', unit: '°C'   },
  { key: 'humidity', label: '습도',   icon: 'water-outline',       color: '#3b82f6', unit: '%'    },
  { key: 'light',    label: '조도',   icon: 'sunny-outline',       color: '#f59e0b', unit: ' lux' },
  { key: 'air',      label: '대기질', icon: 'leaf-outline',        color: '#8b5cf6', unit: ' ppm' },
]

/** 웹 QUICK_RANGES와 동일 */
const QUICK_RANGES: { label: string; type: RangeType }[] = [
  { label: '오늘', type: 'daily'   },
  { label: '주간', type: 'weekly'  },
  { label: '월간', type: 'monthly' },
  { label: '연간', type: 'yearly'  },
]

// ────────────────────────────────────────────────
// 유틸 — 웹 sensorAggregate.js와 동일 로직
// ────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateStr(a) === toDateStr(b)
}

type Grouped = Record<string, { sum: number; count: number; min: number; max: number }>

function pushResult(grouped: Grouped, key: string, time: string, result: ChartData[]) {
  result.push({
    time,
    value: grouped[key] ? parseFloat((grouped[key].sum / grouped[key].count).toFixed(1)) : 0,
    max:   grouped[key] ? parseFloat(grouped[key].max.toFixed(1)) : 0,
    min:   grouped[key] ? parseFloat(grouped[key].min.toFixed(1)) : 0,
  })
}

function accum(grouped: Grouped, key: string, v: number) {
  if (!grouped[key]) grouped[key] = { sum: 0, count: 0, min: Infinity, max: -Infinity }
  grouped[key].sum   += v
  grouped[key].count += 1
  grouped[key].min    = Math.min(grouped[key].min, v)
  grouped[key].max    = Math.max(grouped[key].max, v)
}

/** 시간별 집계 — 웹 aggregateByHour 동일 */
function aggregateByHour(
  records: SensorRecord[],
  getValue: (r: SensorRecord) => number,
  targetDate: string,
): ChartData[] {
  const grouped: Grouped = {}
  records.forEach(r => {
    const hour = r.recordedAt?.slice(11, 13)
    if (!hour) return
    accum(grouped, hour, getValue(r))
  })
  const isToday = targetDate === toDateStr(new Date())
  const maxHour = isToday ? new Date().getHours() : 23
  const result: ChartData[] = []
  for (let h = 0; h <= maxHour; h++) {
    pushResult(grouped, pad(h), `${h}시`, result)
  }
  return result
}

/** 일별 집계 — 웹 aggregateByDay 동일 */
function aggregateByDay(
  records: SensorRecord[],
  getValue: (r: SensorRecord) => number,
  startDate: string,
  endDate: string,
): ChartData[] {
  const grouped: Grouped = {}
  records.forEach(r => {
    const day = r.recordedAt?.slice(0, 10)
    if (!day) return
    accum(grouped, day, getValue(r))
  })
  const result: ChartData[] = []
  const current = new Date(startDate)
  const end     = new Date(endDate)
  while (current <= end) {
    const key = toDateStr(current)
    pushResult(grouped, key, key.slice(5).replace('-', '/'), result)
    current.setDate(current.getDate() + 1)
  }
  return result
}

/** 주차별 집계 — 웹 aggregateByWeek 동일 */
function aggregateByWeek(
  records: SensorRecord[],
  getValue: (r: SensorRecord) => number,
  endDate: string,
): ChartData[] {
  const grouped: Grouped = {}
  records.forEach(r => {
    const day = parseInt(r.recordedAt?.slice(8, 10) ?? '0')
    if (!day) return
    const week = String(Math.ceil(day / 7))
    accum(grouped, week, getValue(r))
  })
  const endDateObj = new Date(endDate)
  const month      = endDateObj.getMonth()
  const lastDay    = new Date(endDateObj.getFullYear(), month + 1, 0).getDate()
  const currentDay = parseInt(endDate.slice(8, 10))
  const maxWeek    = Math.ceil(currentDay / 7)
  const m          = month + 1
  const result: ChartData[] = []
  for (let w = 1; w <= maxWeek; w++) {
    const wStart = (w - 1) * 7 + 1
    const wEnd   = Math.min(w * 7, lastDay)
    pushResult(grouped, String(w), `${m}/${wStart}~${m}/${wEnd}`, result)
  }
  return result
}

/** 월별 집계 — 웹 aggregateByMonth 동일 */
function aggregateByMonth(
  records: SensorRecord[],
  getValue: (r: SensorRecord) => number,
  startDate: string,
  endDate: string,
): ChartData[] {
  const grouped: Grouped = {}
  records.forEach(r => {
    const month = r.recordedAt?.slice(0, 7)
    if (!month) return
    accum(grouped, month, getValue(r))
  })
  const [sy, sm] = startDate.slice(0, 7).split('-').map(Number)
  const [ey, em] = endDate.slice(0, 7).split('-').map(Number)
  const result: ChartData[] = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${pad(m)}`
    pushResult(grouped, key, `${m}월`, result)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return result
}

/** 연도별 집계 — 웹 aggregateByYear 동일 */
function aggregateByYear(
  records: SensorRecord[],
  getValue: (r: SensorRecord) => number,
  startDate: string,
  endDate: string,
): ChartData[] {
  const grouped: Grouped = {}
  records.forEach(r => {
    const year = r.recordedAt?.slice(0, 4)
    if (!year) return
    accum(grouped, year, getValue(r))
  })
  const startYear = parseInt(startDate.slice(0, 4))
  const endYear   = parseInt(endDate.slice(0, 4))
  const result: ChartData[] = []
  for (let y = startYear; y <= endYear; y++) {
    pushResult(grouped, String(y), `${y}년`, result)
  }
  return result
}

/** X축 라벨 밀도 줄이기 */
function sparseLabels(pts: { value: number; label?: string }[], maxLabels = 7) {
  if (pts.length <= maxLabels) return pts
  const nth = Math.ceil(pts.length / maxLabels)
  return pts.map((p, i) => ({ ...p, label: i % nth === 0 ? p.label : '' }))
}

// ────────────────────────────────────────────────
// 서브 컴포넌트
// ────────────────────────────────────────────────

const StatRow = ({ data, unit, color }: { data: ChartData[]; unit: string; color: string }) => {
  const valid  = data.filter(d => d.value !== 0)
  const avgVal = valid.length ? (valid.reduce((s, d) => s + d.value, 0) / valid.length).toFixed(1) : '-'
  const maxVal = valid.length ? Math.max(...valid.map(d => d.max)).toFixed(1) : '-'
  const minVal = valid.length ? Math.min(...valid.map(d => d.min)).toFixed(1) : '-'

  return (
    <View className='flex-row gap-2 mb-4'>
      {[
        { label: '평균', value: avgVal, c: color     },
        { label: '최고', value: maxVal, c: '#ef4444' },
        { label: '최저', value: minVal, c: '#3b82f6' },
      ].map(s => (
        <View key={s.label} className='flex-1 bg-white rounded-2xl border border-gray-100 py-3 items-center'>
          <Text className='text-xs text-gray-400 mb-1'>{s.label}</Text>
          <Text className='text-base font-bold' style={{ color: s.c }}>
            {s.value !== '-' ? `${s.value}${unit}` : '-'}
          </Text>
        </View>
      ))}
    </View>
  )
}

const Legend = ({ color }: { color: string }) => (
  <View className='flex-row gap-4 mt-2 justify-end pr-1'>
    {[
      { c: color,     label: '평균' },
      { c: '#ef4444', label: '최고' },
      { c: '#3b82f6', label: '최저' },
    ].map(l => (
      <View key={l.label} className='flex-row items-center gap-1'>
        <View className='w-3 h-3 rounded-full' style={{ backgroundColor: l.c }} />
        <Text className='text-xs text-gray-500'>{l.label}</Text>
      </View>
    ))}
  </View>
)

const SensorAreaChart = ({
  data, color, unit, chartWidth, compact = false,
}: {
  data: ChartData[]
  color: string
  unit: string
  chartWidth: number
  compact?: boolean
}) => {
  if (!data.length) return null

  const avgPts = sparseLabels(data.map(d => ({ value: d.value, label: d.time })))
  const maxPts = data.map(d => ({ value: d.max }))
  const minPts = data.map(d => ({ value: d.min }))

  const spacing = avgPts.length > 0
    ? Math.max(compact ? 10 : 15, Math.floor(chartWidth / avgPts.length))
    : 40

  const height = compact ? 140 : 220

  // 최고값 기준으로 Y축 범위 결정 (10% 여유)
  const dataMax = Math.max(...data.map(d => d.max))
  const yMax = parseFloat((dataMax * 1.1).toFixed(1))

  return (
    <LineChart
      areaChart
      data={avgPts}
      data2={maxPts}
      data3={minPts}
      width={chartWidth}
      height={height}
      yAxisLabelWidth={compact ? 32 : 45}
      spacing={spacing}
      maxValue={yMax}
      curved
      animateOnDataChange
      color1={color}
      startFillColor1={color} endFillColor1={color}
      startOpacity1={0.35}    endOpacity1={0.01}
      color2='#ef4444'
      startOpacity2={0} endOpacity2={0}
      color3='#3b82f6'
      startOpacity3={0} endOpacity3={0}
      thickness1={2} thickness2={1.5} thickness3={1.5}
      hideDataPoints
      noOfSections={4}
      rulesType='solid'    rulesColor='#f3f4f6'
      xAxisColor='#e5e7eb' yAxisColor='#e5e7eb'
      yAxisTextStyle={{ fontSize: 10, color: '#9ca3af' }}
      xAxisLabelTextStyle={{ fontSize: 9, color: '#9ca3af', width: 36 }}
      initialSpacing={8} endSpacing={8}
      pointerConfig={{
        pointerStripHeight: height - 40,
        pointerLabelWidth: 140,
        pointerLabelHeight: 72,
        pointerLabelComponent: (items: any[]) => (
          <View className='bg-gray-800 px-3 py-2 rounded-xl' style={{ gap: 3 }}>
            <Text className='text-white text-xs'>평균 {items[0]?.value ?? '-'}{unit}</Text>
            <Text className='text-white text-xs' style={{ color: '#fca5a5' }}>최고 {items[1]?.value ?? '-'}{unit}</Text>
            <Text className='text-white text-xs' style={{ color: '#93c5fd' }}>최저 {items[2]?.value ?? '-'}{unit}</Text>
          </View>
        ),
      }}
    />
  )
}

// ────────────────────────────────────────────────
// 메인 화면
// ────────────────────────────────────────────────

export default function DataScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore(s => s.role)
  const { showToast } = useAuthStore()

  const todayDate = new Date()

  const [startDate,   setStartDate]   = useState<Date>(todayDate)
  const [endDate,     setEndDate]     = useState<Date>(todayDate)
  const [rangeType,   setRangeType]   = useState<RangeType>('daily')
  const [showStart,   setShowStart]   = useState(false)
  const [showEnd,     setShowEnd]     = useState(false)
  const [historyData, setHistoryData] = useState<SensorHistory | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [activeTab,   setActiveTab]   = useState<SensorTab>('all')
  const [activeQuick, setActiveQuick] = useState<string>('오늘')

  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') {
      router.replace('/(tabs)/home' as any)
    }
  }, [isReady, isLoggedIn, role])

  const handleFetch = useCallback(async (s: Date = startDate, e: Date = endDate) => {
    if (s > e) { showToast('시작일이 종료일보다 늦을 수 없습니다.'); return }
    setLoading(true)
    try {
      setHistoryData(await getSensorHistory(toDateStr(s), toDateStr(e)))
    } catch {
      showToast('데이터 조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, showToast])

  // 마운트 시 오늘 데이터 자동 조회
  useEffect(() => {
    handleFetch(todayDate, todayDate)
  }, [])

  /** 웹 handleQuickRange와 동일한 날짜 계산 */
  const handleQuickRange = (type: RangeType, label: string) => {
    const now         = new Date()
    const currentYear = now.getFullYear()
    const todayStr    = toDateStr(now)
    let startStr: string

    if (type === 'daily') {
      startStr = todayStr
    } else if (type === 'weekly') {
      // 이번 달 1일부터
      startStr = `${currentYear}-${pad(now.getMonth() + 1)}-01`
    } else if (type === 'monthly') {
      // 올해 1월 1일부터
      startStr = `${currentYear}-01-01`
    } else {
      // 5년 전 1월 1일부터
      startStr = `${currentYear - 5}-01-01`
    }

    const s = new Date(startStr)
    const e = new Date(todayStr)
    setStartDate(s)
    setEndDate(e)
    setRangeType(type)
    setActiveQuick(label)
    handleFetch(s, e)
  }

  /** 웹 getChartData와 동일한 집계 분기 */
  const getChartData = useCallback((key: Exclude<SensorTab, 'all'>): ChartData[] => {
    if (!historyData) return []

    let records: SensorRecord[]
    let getValue: (r: SensorRecord) => number

    if (key === 'temp')          { records = historyData.dht;   getValue = r => r.temperature }
    else if (key === 'humidity') { records = historyData.dht;   getValue = r => r.humidity    }
    else if (key === 'light')    { records = historyData.light; getValue = r => r.lightValue  }
    else                         { records = historyData.air;   getValue = r => r.rawValue    }

    const startStr = toDateStr(startDate)
    const endStr   = toDateStr(endDate)

    if (rangeType === 'yearly')  return aggregateByYear(records, getValue, startStr, endStr)
    if (rangeType === 'monthly') return aggregateByMonth(records, getValue, startStr, endStr)
    if (rangeType === 'weekly')  return aggregateByWeek(records, getValue, endStr)
    if (rangeType === 'daily' || isSameDay(startDate, endDate))
                                 return aggregateByHour(records, getValue, startStr)

    // 수동 날짜 선택 시 범위에 따라 자동 분기 (웹 동일)
    const dayDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (dayDiff > 365) return aggregateByYear(records, getValue, startStr, endStr)
    if (dayDiff > 60)  return aggregateByMonth(records, getValue, startStr, endStr)
    return aggregateByDay(records, getValue, startStr, endStr)
  }, [historyData, rangeType, startDate, endDate])

  const tempData     = useMemo(() => getChartData('temp'),     [getChartData])
  const humidityData = useMemo(() => getChartData('humidity'), [getChartData])
  const lightData    = useMemo(() => getChartData('light'),    [getChartData])
  const airData      = useMemo(() => getChartData('air'),      [getChartData])

  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />

  const singleTabs = SENSOR_TABS.filter(t => t.key !== 'all')

  return (
    <ScreenWrapper scroll>

      {/* ── 헤더 ── */}
      <View className='px-5 pt-5 pb-4'>
        <Text className='text-2xl font-bold text-gray-900'>데이터 확인</Text>
        <Text className='text-sm text-gray-400 mt-1'>기간별 센서 이력 조회</Text>
      </View>

      {/* ── 빠른 기간 선택 ── */}
      <View className='px-5 mb-3'>
        <View className='flex-row gap-2'>
          {QUICK_RANGES.map(r => (
            <Pressable
              key={r.label}
              onPress={() => handleQuickRange(r.type, r.label)}
              className={`flex-1 py-2 rounded-xl items-center border ${
                activeQuick === r.label ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-xs font-semibold ${activeQuick === r.label ? 'text-white' : 'text-gray-500'}`}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── 날짜 직접 선택 ── */}
      <View className='px-5 mb-4'>
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
            onPress={() => { setActiveQuick(''); setRangeType('custom'); handleFetch() }}
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
            mode='date' display='default' value={startDate} maximumDate={endDate}
            onChange={(e, d) => { setShowStart(false); if (e.type === 'set' && d) setStartDate(d) }}
          />
        )}
        {showEnd && (
          <DateTimePicker
            mode='date' display='default' value={endDate}
            minimumDate={startDate} maximumDate={new Date()}
            onChange={(e, d) => { setShowEnd(false); if (e.type === 'set' && d) setEndDate(d) }}
          />
        )}
      </View>

      {/* ── 센서 탭 ── */}
      <View className='px-5 mb-4'>
        <View className='flex-row bg-gray-100 rounded-2xl p-1 gap-1'>
          {SENSOR_TABS.map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 items-center py-2 rounded-xl ${activeTab === tab.key ? 'bg-white' : ''}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-400'}`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── 차트 영역 ── */}
      <View className='px-5 pb-10'>

        {!historyData ? (
          <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
            <Ionicons name='bar-chart-outline' size={40} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-3 text-center'>기간을 선택하고 조회하기를 눌러주세요</Text>
          </View>

        ) : loading ? (
          <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
            <ActivityIndicator size='large' color='#6b7280' />
            <Text className='text-sm text-gray-400 mt-3'>데이터 불러오는 중...</Text>
          </View>

        ) : activeTab === 'all' ? (
          /* ── 전체 탭: 1×4 리스트 ── */
          <View className='gap-4'>
            {singleTabs.map(tab => {
              const data = tab.key === 'temp'     ? tempData
                         : tab.key === 'humidity' ? humidityData
                         : tab.key === 'light'    ? lightData
                         :                          airData
              return (
                <View key={tab.key} className='bg-white rounded-2xl border border-gray-100 p-4'>
                  <Text className='text-sm font-bold mb-3' style={{ color: tab.color }}>
                    {tab.label} ({tab.unit.trim()})
                  </Text>
                  {data.length === 0 ? (
                    <View className='items-center py-6'>
                      <Text className='text-sm text-gray-400'>데이터 없음</Text>
                    </View>
                  ) : (
                    <>
                      <StatRow data={data} unit={tab.unit} color={tab.color} />
                      <SensorAreaChart
                        data={data} color={tab.color} unit={tab.unit}
                        chartWidth={CHART_WIDTH} compact
                      />
                      <Legend color={tab.color} />
                    </>
                  )}
                </View>
              )
            })}
          </View>

        ) : (
          /* ── 단일 탭 ── */
          (() => {
            const tab  = SENSOR_TABS.find(t => t.key === activeTab)!
            const data = activeTab === 'temp'     ? tempData
                       : activeTab === 'humidity' ? humidityData
                       : activeTab === 'light'    ? lightData
                       :                            airData
            return data.length === 0 ? (
              <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
                <Ionicons name='document-outline' size={40} color='#d1d5db' />
                <Text className='text-sm text-gray-400 mt-3'>해당 기간에 데이터가 없습니다</Text>
              </View>
            ) : (
              <View className='bg-white rounded-2xl border border-gray-100 p-4'>
                <Text className='text-sm font-bold mb-3' style={{ color: tab.color }}>
                  {tab.label} ({tab.unit.trim()})
                </Text>
                <StatRow data={data} unit={tab.unit} color={tab.color} />
                <SensorAreaChart
                  data={data} color={tab.color} unit={tab.unit}
                  chartWidth={CHART_WIDTH}
                />
                <Legend color={tab.color} />
              </View>
            )
          })()
        )}
      </View>
    </ScreenWrapper>
  )
}
