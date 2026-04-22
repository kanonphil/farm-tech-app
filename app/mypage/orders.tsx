import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { getOrderList } from '@/src/api/orderApi'
import { Order } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import useAuthStore from '@/src/store/authStore'

const PERIODS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '1년',   months: 12 },
]

function getDateRange(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'READY':    return { label: '주문접수', bg: '#f3f4f6', color: '#6b7280' }
    case 'PAID':     return { label: '결제완료', bg: '#eff6ff', color: '#3b82f6' }
    case 'SHIPPING': return { label: '배송중',   bg: '#E1F5EE', color: '#0F6E56' }
    case 'SHIPPED':  return { label: '배송완료', bg: '#e0f2fe', color: '#0369a1' }
    case 'DONE':     return { label: '구매확정', bg: '#F1EFE8', color: '#5F5E5A' }
    case 'REFUNDED': return { label: '환불/취소', bg: '#fef2f2', color: '#ef4444' }
    default:         return { label: status,     bg: '#f3f4f6', color: '#6b7280' }
  }
}

/**
 * 주문 내역 화면
 */
export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState(3)
  const showToast = useAuthStore((state) => state.showToast)

  const loadOrders = useCallback(async (months: number) => {
    setIsLoading(true)
    const { startDate, endDate } = getDateRange(months)
    try {
      setOrders(await getOrderList(startDate, endDate))
    } catch {
      showToast('주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useFocusEffect(useCallback(() => {
    loadOrders(selectedMonths)
  }, [loadOrders, selectedMonths]))

  const handlePeriodChange = (months: number) => {
    setSelectedMonths(months)
    loadOrders(months)
  }

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
      {/* 헤더 */}
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

      {/* 기간 필터 */}
      <View className="flex-row gap-x-2 bg-white px-4 py-3 border-b border-[#f0f0f0]">
        {PERIODS.map(({ label, months }) => (
          <Pressable
            key={months}
            onPress={() => handlePeriodChange(months)}
            style={({ pressed }) => [
              {
                borderWidth: 1,
                borderColor: selectedMonths === months ? Colors.primary : '#ddd',
                backgroundColor: selectedMonths === months ? Colors.primary : '#fff',
              },
              pressed && { opacity: 0.7 },
            ]}
            className="px-3 py-1.5 rounded-full"
          >
            <Text
              className="text-xs font-medium"
              style={{ color: selectedMonths === months ? '#fff' : '#555' }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

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