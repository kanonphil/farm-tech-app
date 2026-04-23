import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { getOrderList } from '@/src/api/orderApi'
import { Order } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import useAuthStore from '@/src/store/authStore'

// ─────────────────────────────────────────────
// 기간 옵션
// ─────────────────────────────────────────────
const PERIODS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '1년',   months: 12 },
  { label: '직접입력', months: 0 },
]

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

/** 날짜 → "YYYY-MM-DD" 문자열 */
const fmt = (d: Date) => d.toISOString().split('T')[0]

/** 오늘 기준 N개월 전 ~ 오늘 날짜 반환 */
function getDateRange(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  return { startDate: fmt(start), endDate: fmt(end) }
}

/** 주문 상태 → 뱃지 색상/텍스트 */
function getStatusBadge(status: string) {
  switch (status) {
    case 'READY':    return { label: '주문접수',  bg: '#f3f4f6', color: '#6b7280' }
    case 'PAID':     return { label: '결제완료',  bg: '#eff6ff', color: '#3b82f6' }
    case 'SHIPPING': return { label: '배송중',    bg: '#E1F5EE', color: '#0F6E56' }
    case 'SHIPPED':  return { label: '배송완료',  bg: '#e0f2fe', color: '#0369a1' }
    case 'DONE':     return { label: '구매확정',  bg: '#F1EFE8', color: '#5F5E5A' }
    case 'REFUNDED': return { label: '환불/취소', bg: '#fef2f2', color: '#ef4444' }
    default:         return { label: status,      bg: '#f3f4f6', color: '#6b7280' }
  }
}

// ─────────────────────────────────────────────
// 주문 내역 화면
// ─────────────────────────────────────────────
export default function OrdersScreen() {

  // ── 상태 ─────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonths, setSelectedMonths] = useState(3)

  // 직접 입력 날짜
  const [customStart, setCustomStart] = useState(new Date())
  const [customEnd, setCustomEnd] = useState(new Date())

  const showToast = useAuthStore((state) => state.showToast)

  // ── 주문 목록 조회 ────────────────────────────
  const loadOrders = useCallback(async (months: number, start?: Date, end?: Date) => {
    setIsLoading(true)
    let startDate: string
    let endDate: string

    if (months === 0 && start && end) {
      // 직접 입력 날짜 사용
      startDate = fmt(start)
      endDate = fmt(end)
    } else {
      const range = getDateRange(months)
      startDate = range.startDate
      endDate = range.endDate
    }

    try {
      setOrders(await getOrderList(startDate, endDate))
    } catch {
      showToast('주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  // ── 화면 포커스 시 조회 ───────────────────────
  useFocusEffect(useCallback(() => {
    loadOrders(selectedMonths)
  }, [loadOrders, selectedMonths]))

  // ── 기간 변경 ─────────────────────────────────
  const handlePeriodChange = (months: number) => {
    setSelectedMonths(months)
    // 직접입력(0)은 조회 버튼 눌렀을 때만 조회
    if (months !== 0) loadOrders(months)
  }

  // ── 날짜 피커 (Android) ───────────────────────
  const openStartPicker = () => {
    DateTimePickerAndroid.open({
      value: customStart,
      mode: 'date',
      maximumDate: customEnd,
      onChange: (_, date) => { if (date) setCustomStart(date) },
    })
  }

  const openEndPicker = () => {
    DateTimePickerAndroid.open({
      value: customEnd,
      mode: 'date',
      minimumDate: customStart,
      maximumDate: new Date(),
      onChange: (_, date) => { if (date) setCustomEnd(date) },
    })
  }

  // ── 주문 카드 렌더링 ──────────────────────────
  const renderItem = ({ item }: { item: Order }) => {
    const badge = getStatusBadge(item.orderStatus)
    const firstName = item.orderItemDTOList?.[0]?.productName ?? '상품'
    const extra = (item.orderItemDTOList?.length ?? 1) - 1
    const label = extra > 0 ? `${firstName} 외 ${extra}건` : firstName

    return (
      <Pressable
        onPress={() => router.push(`/mypage/order-detail?orderId=${item.orderId}`)}
        className="bg-white px-4 py-3.5 border-b border-[#f0f0f0]"
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs text-[#888]">
            {item.orderCreatedAt?.slice(0, 10)}
          </Text>
          <View style={{ backgroundColor: badge.bg }} className="rounded-full px-2.5 py-0.5">
            <Text style={{ color: badge.color }} className="text-[10px] font-medium">
              {badge.label}
            </Text>
          </View>
        </View>
        <Text className="text-sm font-medium text-[#1a1a1a] mb-0.5" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-sm font-bold text-[#1a1a1a]">
          {formatPrice(item.orderTotalPrice)}
        </Text>
      </Pressable>
    )
  }

  return (
    <ScreenWrapper edges={['top']}>

      {/* ── 헤더 ─────────────────────────────── */}
      <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text className="text-base font-bold text-[#1a1a1a]">주문 내역</Text>
      </View>

      {/* ── 기간 필터 - 세그먼트 컨트롤 ─────────── */}
      <View className="bg-white px-4 py-3 border-b border-[#f0f0f0]">
        <View className="flex-row rounded-lg border border-[#eee] overflow-hidden bg-[#f5f5f5] p-1 gap-x-1">
          {PERIODS.map(({ label, months }) => (
            <Pressable
              key={months}
              onPress={() => handlePeriodChange(months)}
              style={[
                { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 6 },
                selectedMonths === months && { backgroundColor: Colors.primary },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: selectedMonths === months ? 'bold' : '400',
                  color: selectedMonths === months ? '#fff' : '#666',
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 직접 입력 날짜 선택 */}
        {selectedMonths === 0 && (
          <View className="flex-row items-center mt-3 gap-x-2">
            <Pressable
              onPress={openStartPicker}
              className="flex-1 items-center border border-[#ddd] rounded-lg py-2"
            >
              <Text className="text-sm text-[#1a1a1a]">{fmt(customStart)}</Text>
            </Pressable>
            <Text className="text-sm text-[#888]">~</Text>
            <Pressable
              onPress={openEndPicker}
              className="flex-1 items-center border border-[#ddd] rounded-lg py-2"
            >
              <Text className="text-sm text-[#1a1a1a]">{fmt(customEnd)}</Text>
            </Pressable>
            <Pressable
              onPress={() => loadOrders(0, customStart, customEnd)}
              style={{ backgroundColor: Colors.primary }}
              className="px-3 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-bold">조회</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── 주문 목록 ─────────────────────────── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.orderId)}
          renderItem={renderItem}
          className="bg-[#f5f5f5]"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-sm text-[#bbb]">해당 기간에 주문 내역이 없습니다</Text>
            </View>
          }
        />
      )}

    </ScreenWrapper>
  )
}