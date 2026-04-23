import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import useAuthStore from '@/src/store/authStore'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import { getIoTStatus, IoTStatus } from '@/src/api/iotApi'
import ConnectionBanner from '@/src/components/common/ConnectionBanner'
import { logout } from '@/src/api/authApi'

/**
 * 대시보드 탭 (app/(tabs)/dashboard.tsx)
 *
 * MANAGER 전용 — IoT 센서 현황을 한눈에 확인합니다.
 * 백엔드 /dashboards/** 엔드포인트를 사용합니다.
 *
 * 가드 전략:
 *   AuthGuard는 로그인 여부만 체크하므로 사용하지 않습니다.
 *   useRequireAuth()로 비로그인 리다이렉트를 처리하고,
 *   useEffect로 MANAGER 역할 여부를 추가로 검증합니다.
 * 
 * 연결 상태:
 *   LIVE        — Pi 실시간 데이터, 배너 없음
 *   DB_FALLBACK — Pi 오프라인, 배너 표시 + DB 마지막 값 표시
 *   DB_ERROR    — DB도 오프라인, 배너 표시 + 값 없음
 *   네트워크    — 백엔드 서버 자체 도달 불가, 배너 표시
 */

// ── 배너 타입 ──────────────────────────────────────────────────

/**
 * null   → 정상 (배너 없음)
 * device → Pi 오프라인
 * database → DB 오프라인
 */
type BannerState = null | 'device' | 'database'

// ── 센서 카드 타입 ─────────────────────────────────────────────
interface SensorCardProps {
  /** 카드 아이콘 이름 (Ionicons) */
  icon: keyof typeof Ionicons.glyphMap
  /** 아이콘 색상 */
  iconColor: string
  /** 카드 배경 Tailwind 클래스 */
  cardBg: string
  /** 아이콘 배경 Tailwind 클래스 */
  iconBg: string
  /** 센서 이름 */
  label: string
  /** 현재 측정값 (없으면 '--') */
  value: string | number | null
  /** 단위 (예: '°C', '%', 'lux', 'ppm') */
  unit: string
  /** 상태 텍스트 (예: '정상', '주의') */
  status: string
  /** 상태 색상 Tailwind 클래스 */
  statusColor: string
}

/**
 * 개별 센서 현황 카드
 */
function SensorCard({
  icon, iconColor, cardBg, iconBg,
  label, value, unit, status, statusColor,
}: SensorCardProps) {
  return (
    <View className={`${cardBg} rounded-2xl p-4 flex-1 border border-gray-100`}>
      {/* 아이콘 */}
      <View className={`${iconBg} w-10 h-10 rounded-full items-center justify-center mb-3`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      {/* 라벨 */}
      <Text className='text-xs text-gray-500 mb-1'>
        {label}
      </Text>

      {/* 측정값 */}
      <Text className='text-2xl font-bold text-gray-900'>
        {value ?? '--'}
        <Text className='text-sm font-normal text-gray-400'>
          {unit}
        </Text>
      </Text>

      {/* 상태 뱃지 */}
      <Text className={`text-xs font-medium mt-2 ${statusColor}`}>
        {status}
      </Text>
    </View>
  )
}

// ── 메인 화면 ─────────────────────────────────────────────────
export default function DashboardScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((state) => state.role)

  const [status, setStatus] = useState<IoTStatus | null>(null)
  const [banner, setBanner] = useState<BannerState>(null)
  const [loading, setLoading] = useState(false)

  /**
   * MANAGER 역할 검증
   * 로그인은 됐지만 MANAGER가 아니면 홈 탭으로 이동합니다.
   */
  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') {
      router.replace('/(tabs)/home')
    }
  }, [isReady, isLoggedIn, role])

  const { clearToken, showAlert } = useAuthStore()

  // ── 로그아웃 ──────────────────────────────────
  const handleLogout = useCallback(() => {
    showAlert('로그아웃 하시겠습니까?', async () => {
      try { await logout() } catch { /* 서버 오류 무시 */ }
      await clearToken()
      router.replace('/(tabs)/home')
    })
  }, [showAlert, clearToken])

  /** IoT 상태 조회 */
  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIoTStatus()

      setStatus(data)

      // source에 따라 배너 결정
      if (data.source === 'DB_FALLBACK') {
        setBanner('device')
      } else if (data.source === 'DB_ERROR') {
        setBanner('database')
        setStatus(null)
      } else {
        // LIVE
        setBanner(null)
      }
    } catch (e: any) {
      // HTTP 503 (DB_ERROR)
      if (e?.response?.status === 503) {
        setBanner('database')
      } else {
        // 네트워크 오류 등 -> 기기 배너로 처리
        setBanner('device')
      }
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

   /** 화면 포커스 시마다 재조회 */
  useFocusEffect(
    useCallback(() => {
      if (isReady && isLoggedIn && role === 'MANAGER') {
        fetchStatus()
      }
    }, [isReady, isLoggedIn, role, fetchStatus])
  )

  // 토큰 복원 중 / 비로그인 / 권한X -> 스피너 표시
  // 인증 체크만 전체 스피너 유지
  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />
  
  return (
    <ScreenWrapper scroll>

      {/* ── 연결 상태 배너 (상단 고정) ───────────── */}
      {banner && <ConnectionBanner type={banner} />}
      
      {/* ── 헤더 ────────────────────────────────── */}
      <View className='px-5 pt-5 pb-4'>
        <View>
          <Text className='text-2xl font-bold text-gray-900'>대시보드</Text>
          <Text className='text-sm text-gray-400 mt-1'>
            {banner === null    ? '실시간 센서 현황' :
            banner === 'device' ? 'DB 마지막 저장값 표시 중' :
                                  '데이터를 불러올 수 없습니다'}
          </Text>
        </View>
        {/* 데이터 갱신 중일 때만 작은 스피너 */}
        {/* {loading && <ActivityIndicator size='small' color='#9ca3af' />} */}
      </View>

      {/* ── 센서 카드 그리드 ─────────────────────── */}
      <View className='px-5'>
        <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
          센서 현황
        </Text>

        <View className='flex-row gap-3 mb-3'>
          <SensorCard
            icon='thermometer-outline' iconColor='#f59e0b'
            iconBg='bg-amber-100' cardBg='bg-amber-50'
            label='온도' value={status?.temperature ?? null} unit='°C'
            status={status?.temperature != null ? '정상' : '데이터 없음'}
            statusColor={status?.temperature != null ? 'text-green-500' : 'text-gray-400'}
          />
          <SensorCard
            icon='water-outline' iconColor='#3b82f6'
            iconBg='bg-blue-100' cardBg='bg-blue-50'
            label='습도' value={status?.humidity ?? null} unit='%'
            status={status?.humidity != null ? '정상' : '데이터 없음'}
            statusColor={status?.humidity != null ? 'text-green-500' : 'text-gray-400'}
          />
        </View>

        <View className='flex-row gap-3'>
          <SensorCard
            icon='sunny-outline' iconColor='#eab308'
            iconBg='bg-yellow-100' cardBg='bg-yellow-50'
            label='조도' value={status?.lux ?? null} unit='lux'
            status={status?.lux != null ? '정상' : '데이터 없음'}
            statusColor={status?.lux != null ? 'text-green-500' : 'text-gray-400'}
          />
          <SensorCard
            icon='leaf-outline' iconColor='#22c55e'
            iconBg='bg-green-100' cardBg='bg-green-50'
            label='대기질' value={status?.airRaw ?? null} unit='raw'
            status={status?.airRaw != null ? '정상' : '데이터 없음'}
            statusColor={status?.airRaw != null ? 'text-green-500' : 'text-gray-400'}
          />
        </View>
      </View>

      {/* ── 액추에이터 상태 (LIVE일 때만 표시) ─────── */}
      {status?.source === 'LIVE' && (
        <View className='px-5 mt-6 pb-8'>
          <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
            액추에이터 상태
          </Text>

          <View className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
            {[
              {
                icon: 'bulb-outline', iconColor: '#eab308', iconBg: 'bg-yellow-100',
                label: 'LED 조명',
                info: status.ledOn ? `ON  ${Math.round((status.ledBrightness ?? 0) * 100)}%` : 'OFF',
                isOn: status.ledOn,
              },
              {
                icon: 'aperture-outline', iconColor: '#3b82f6', iconBg: 'bg-blue-100',
                label: '환풍기',
                info: status.fanOn ? `ON  ${Math.round((status.fanSpeed ?? 0) * 100)}%` : 'OFF',
                isOn: status.fanOn,
              },
              {
                icon: 'volume-high-outline', iconColor: '#a855f7', iconBg: 'bg-purple-100',
                label: '부저',
                info: status.buzzerOn ? `ON  ${status.buzzerFreq ?? '--'} Hz` : 'OFF',
                isOn: status.buzzerOn,
              },
            ].map((item, idx, arr) => (
              <View
                key={item.label}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  idx < arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className='flex-row items-center gap-3'>
                  <View className={`${item.iconBg} w-9 h-9 rounded-full items-center justify-center`}>
                    <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <Text className='text-sm font-medium text-gray-800'>{item.label}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={`text-xs font-medium ${item.isOn ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.info}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── DB_FALLBACK일 때 액추에이터 섹션 안내 ─── */}
      {status?.source === 'DB_FALLBACK' && (
        <View className='px-5 mt-6 pb-8'>
          <Text className='text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide'>
            액추에이터 상태
          </Text>
          <View className='bg-white rounded-2xl border border-gray-100 p-6 items-center'>
            <Ionicons name='wifi-outline' size={28} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-2 text-center'>
              기기 연결이 끊어져 현재 상태를 확인할 수 없습니다
            </Text>
          </View>
        </View>
      )}
      
      {/* ── 로그아웃 ──────────────────────────── */}
      <Pressable 
        onPress={handleLogout} 
        style={({ pressed }) => pressed && { opacity: 0.7 }}
        className="py-4 items-center"
      >
        <Text className="text-sm text-[#aaa]">로그아웃</Text>
      </Pressable>
      
    </ScreenWrapper>
  )
}