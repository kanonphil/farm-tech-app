import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import AppButton from '@/src/components/common/AppButton'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { getOrderList, confirmOrder, cancelPayment } from '@/src/api/orderApi'
import { Order } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import useAuthStore from '@/src/store/authStore'

function getDateRange(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

function StatusStep({ status }: { status: string }) {
  const steps = ['PAID', 'SHIPPING', 'SHIPPED', 'DONE']
  const currentIdx = steps.indexOf(status)

  return (
    <View className="flex-row items-center justify-between px-2 py-3">
      {['결제완료', '배송중', '배송완료', '구매확정'].map((label, i) => (
        <React.Fragment key={label}>
          <View className="items-center">
            <View
              className="h-6 w-6 rounded-full items-center justify-center"
              style={{ backgroundColor: i <= currentIdx ? Colors.primary : '#e5e7eb' }}
            >
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
            <Text className="text-[10px] mt-1" style={{ color: i <= currentIdx ? Colors.primary : '#9ca3af' }}>
              {label}
            </Text>
          </View>
          {i < 3 && (
            <View
              className="flex-1 h-0.5 mx-1"
              style={{ backgroundColor: i < currentIdx ? Colors.primary : '#e5e7eb' }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  )
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const [order, setOrder]       = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActing, setIsActing] = useState(false)
  const { showToast, showAlert } = useAuthStore()

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setIsLoading(true)
    const { startDate, endDate } = getDateRange(24)
    try {
      const list = await getOrderList(startDate, endDate)
      const found = list.find((o) => o.orderId === Number(orderId))
      if (found) setOrder(found)
      else showToast('주문 정보를 찾을 수 없습니다.')
    } catch {
      showToast('주문 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [orderId, showToast])

  useFocusEffect(useCallback(() => { loadOrder() }, [loadOrder]))

  /** 구매 확정 */
  const handleConfirm = () => {
    showAlert('구매를 확정하시겠습니까?\n확정 후 취소가 불가능합니다.', async () => {
      setIsActing(true)
      try {
        await confirmOrder(Number(orderId))
        showToast('구매가 확정되었습니다.')
        loadOrder()
      } catch {
        showToast('구매 확정에 실패했습니다.')
      } finally {
        setIsActing(false)
      }
    })
  }

  /** 주문 취소 */
  const handleCancel = () => {
    showAlert('주문을 취소하시겠습니까?', async () => {
      setIsActing(true)
      try {
        await cancelPayment(Number(orderId))
        showToast('주문이 취소되었습니다.')
        loadOrder()
      } catch {
        showToast('주문 취소에 실패했습니다.')
      } finally {
        setIsActing(false)
      }
    })
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
        <Text className="text-base font-bold text-[#1a1a1a]">주문 상세</Text>
      </View>

      {isLoading || !order ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-[#f5f5f5]">

          {/* 배송 상태 */}
          {!['READY', 'REFUNDED'].includes(order.orderStatus) && (
            <View className="bg-white px-4 mb-2">
              <StatusStep status={order.orderStatus} />
            </View>
          )}

          {/* 주문 정보 */}
          <View className="bg-white px-4 py-4 mb-2">
            <Text className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">
              주문 정보
            </Text>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-[#888]">주문일</Text>
              <Text className="text-sm text-[#1a1a1a]">{order.orderCreatedAt?.slice(0, 10)}</Text>
            </View>
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-[#888]">결제 금액</Text>
              <Text className="text-sm font-bold text-[#1a1a1a]">{formatPrice(order.orderTotalPrice)}</Text>
            </View>
            {order.paidAt && (
              <View className="flex-row justify-between py-1.5">
                <Text className="text-sm text-[#888]">결제일</Text>
                <Text className="text-sm text-[#1a1a1a]">{order.paidAt.slice(0, 10)}</Text>
              </View>
            )}
          </View>

          {/* 주문 상품 목록 */}
          <View className="bg-white px-4 py-4 mb-2">
            <Text className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">
              주문 상품
            </Text>
            {order.orderItemDTOList?.map((item) => (
              <View key={item.orderItemId} className="flex-row items-center py-2.5 border-b border-[#f5f5f5]">
                <Image
                  source={{ uri: item.imageSavedName }}
                  className="h-16 w-16 rounded-lg bg-[#f4f4f4] mr-3"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#1a1a1a]" numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text className="text-xs text-[#888] mt-0.5">
                    {item.orderItemQty}개 · {formatPrice(item.orderItemPrice)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* 액션 버튼 */}
          <View className="px-4 pb-8 gap-y-2">
            {order.orderStatus === 'SHIPPED' && (
              <AppButton
                title="구매 확정"
                onPress={handleConfirm}
                loading={isActing}
                size="lg"
              />
            )}
            {['READY', 'PAID'].includes(order.orderStatus) && (
              <AppButton
                title="주문 취소"
                variant="outline"
                onPress={handleCancel}
                loading={isActing}
                size="lg"
              />
            )}
          </View>

        </ScrollView>
      )}
    </ScreenWrapper>
  )
}