import { getMyInfo, logout } from '@/src/api/authApi'
import { getOrderList } from '@/src/api/orderApi'
import { getMyReviews, getUnreviewedItems } from '@/src/api/reviewApi'
import AppButton from '@/src/components/common/AppButton'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { Colors } from '@/src/constants/colors'
import useAuthStore from '@/src/store/authStore'
import { Member, Order } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

// ─────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────

/** 오늘 기준 N개월 전 - 오늘 날짜 문자열 반환 */
function getDateRange(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

/** 주문 상태 -> 뱃지 색상/텍스트 */
function getStatusBadge(status: string) {
  switch (status) {
    case 'READY':
      return { label: '주문접수', bg: '#f3f4f6', color: '#6b7280' }
      
    case 'PAID':
      return { label: '결제완료', bg: '#eff6ff', color: '#3b82f6' }
      
    case 'SHIPPING':
      return { label: '배송중', bg: '#E1F5EE', color: '#0F6E56' }
      
    case 'SHIPPED':
      return { label: '배송완료', bg: '#e0f2fe', color: '#0369a1' }
      
    case 'DONE':
      return { label: '구매확정', bg: '#F1EFE8', color: '#5F5E5A' }
      
    case 'REFUNDED':
      return { label: '환불', bg: '#fef2f2', color: '#ef4444' }
  
    default:
      return { label: status, bg: '#f3f4f6', color: '#6b7280' }
  }
}

// ─────────────────────────────────────────────
// 서브 컴포넌트
// ─────────────────────────────────────────────

/**
 * 통계 카드 (주문 수 / 리뷰 수 / 미작성 리뷰)
 */
function StatCard({ num, label }: { 
  num: number
  label: string 
}) {
  return (
    <View className="flex-1 items-center rounded-xl bg-[#f9f9f9] py-3">
      <Text className="text-lg font-semibold text-[#1a1a1a]">{num}</Text>
      <Text className="mt-0.5 text-xs text-[#888]">{label}</Text>
    </View>
  )
}

/**
 * 최근 주문 행 — 주문의 첫 번째 상품명 + 상태 뱃지
 */
function RecentOrderRow({ order }: {
  order: Order
}) {
  const badge = getStatusBadge(order.orderStatus)
  const firstName = order.orderItemDTOList?.[0]?.productName ?? '주문 상품'
  const extraCount = (order.orderItemDTOList?.length ?? 1) - 1
  const label = extraCount > 0 ? `${firstName} 외 ${extraCount}건` : firstName

  return (
    <Pressable
      onPress={() => router.push(`/mypage/order-detail?orderId=${order.orderId}`)}
      className="flex-row items-center py-3 border-b border-[#f0f0f0]"
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      {/* 상품 아이콘 */}
      <View className="h-11 w-11 rounded-xl bg-[#f9f9f9] items-center justify-center mr-3 border border-[#eee]">
        <Ionicons name="cube-outline" size={20} color={Colors.textMuted} />
      </View>

      {/* 주문 정보 */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-[#1a1a1a]" numberOfLines={1}>
          {label}
        </Text>
        <Text className="mt-0.5 text-xs text-[#888]">
          {order.orderCreatedAt?.slice(0, 10)} · {formatPrice(order.orderTotalPrice)}
        </Text>
      </View>

      {/* 상태 뱃지 */}
      <View style={{ backgroundColor: badge.bg }} className="rounded-full px-2 py-0.5">
        <Text style={{ color: badge.color }} className="text-[10px] font-medium">
          {badge.label}
        </Text>
      </View>
    </Pressable>
  )
}

/**
 * 메뉴 아이템 행
 */
function MenuItem({
  icon,
  iconBg,
  label,
  onPress,
  danger = false,
}: {
  icon: string
  iconBg: string
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 border-b border-[#f0f0f0]"
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <View className="flex-row items-center gap-x-3">
        <View
          style={{ backgroundColor: iconBg }}
          className="h-8 w-8 rounded-xl items-center justify-center"
        >
          <Ionicons name={icon as any} size={16} color={danger ? '#ef4444' : '#555'} />
        </View>
        <Text className={`text-sm ${danger ? 'text-[#ef4444]' : 'text-[#1a1a1a]'}`}>
          {label}
        </Text>
      </View>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
    </Pressable>
  )
}

// ─────────────────────────────────────────────
// 메인 화면
// ─────────────────────────────────────────────

function MypageContent() {
  const { clearToken, showToast, showAlert } = useAuthStore()

  const [member, setMember]  = useState<Member | null>(null)
  const [orders, setOrders]  = useState<Order[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [unreviewedCount, setUnreviewedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // ── 데이터 로드 ───────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    const { startDate, endDate } = getDateRange(12)
    try {
      const [memberInfo, orderList, reviews, unreviewed] = await Promise.all([
        getMyInfo(),
        getOrderList(startDate, endDate),
        getMyReviews(startDate, endDate),
        getUnreviewedItems(startDate, endDate),
      ])
      setMember(memberInfo)
      setOrders(orderList)
      setReviewCount(reviews.length)
      setUnreviewedCount(unreviewed.length)
    } catch {
      showToast('정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  // ── 로그아웃 ──────────────────────────────────
  const handleLogout = useCallback(() => {
    showAlert('로그아웃 하시겠습니까?', async () => {
      try { await logout() } catch { /* 서버 오류 무시 */ }
      await clearToken()
      router.replace('/(tabs)/home')
    })
  }, [showAlert, clearToken])

  // ── 회원 탈퇴 ─────────────────────────────────
  const handleWithdraw = useCallback(() => {
    showAlert('정말 탈퇴하시겠습니까?\n탈퇴 후 복구가 불가능합니다.', () => {
      router.push('/mypage/withdraw')
    })
  }, [showAlert])

  // ── 아바타 이니셜 ─────────────────────────────
  const initials = member?.memberName?.slice(0, 2) ?? '?'
  const recentOrders = orders.slice(0, 3)

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScreenWrapper scroll edges={['top']}>

      {/* ── 헤더 ──────────────────────────────── */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-[#eee]">
        <Text className="text-base font-bold text-[#1a1a1a]">마이페이지</Text>
        <Pressable 
          onPress={() => router.push('/notification')}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* ── 프로필 카드 ───────────────────────── */}
      <View className="bg-white px-4 pt-5 pb-4">
        <View className="flex-row items-center gap-x-4 mb-4">
          {/* 아바타 */}
          <View
            className="h-14 w-14 rounded-full items-center justify-center"
            style={{ backgroundColor: '#fde8ea' }}
          >
            <Text style={{ color: Colors.primary }} className="text-lg font-semibold">
              {initials}
            </Text>
          </View>

          {/* 이름 + 이메일 */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-[#1a1a1a]">
              {member?.memberName ?? '-'}
            </Text>
            <Text className="text-xs text-[#888] mt-0.5">
              {member?.memberEmail ?? '-'}
            </Text>
          </View>

          {/* 정보 수정 */}
          <Pressable 
            onPress={() => router.push('/mypage/edit-profile')}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text style={{ color: Colors.primary }} className="text-xs">수정 ›</Text>
          </Pressable>
        </View>

        {/* 통계 카드 */}
        <View className="flex-row gap-x-2">
          <StatCard num={orders.length}    label="주문" />
          <StatCard num={reviewCount}       label="리뷰" />
          <StatCard num={unreviewedCount}   label="미작성 리뷰" />
        </View>
      </View>

      <View className="h-2 bg-[#f0f0f0]" />

      {/* ── 최근 주문 ─────────────────────────── */}
      <View className="bg-white px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            최근 주문
          </Text>
          <Pressable 
            onPress={() => router.push('/mypage/orders')}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text className="text-xs text-[#888]">전체 보기 ›</Text>
          </Pressable>
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <RecentOrderRow key={order.orderId} order={order} />
          ))
        ) : (
          <View className="py-6 items-center">
            <Text className="text-sm text-[#bbb]">최근 주문 내역이 없습니다</Text>
          </View>
        )}
      </View>

      <View className="h-2 bg-[#f0f0f0]" />

      {/* ── 메뉴 ──────────────────────────────── */}
      <View className="bg-white px-4 pt-4">
        <Text className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-1">
          내 계정
        </Text>
        <MenuItem
          icon="location-outline"
          iconBg="#E1F5EE"
          label="배송지 관리"
          onPress={() => router.push('/mypage/edit-profile')}
        />
        <MenuItem
          icon="star-outline"
          iconBg="#EEEDFE"
          label="내 리뷰"
          onPress={() => router.push('/mypage/reviews')}
        />
        <MenuItem
          icon="lock-closed-outline"
          iconBg="#FBEAF0"
          label="비밀번호 변경"
          onPress={() => router.push('/mypage/change-password')}
        />
        <MenuItem
          icon="headset-outline"
          iconBg="#E6F1FB"
          label="고객센터 / 1:1 문의"
          onPress={() => router.push('/mypage/chat')}
        />
        <MenuItem
          icon="person-remove-outline"
          iconBg="#fef2f2"
          label="회원 탈퇴"
          onPress={handleWithdraw}
          danger
        />
      </View>

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

// ─────────────────────────────────────────────
// 내보내기 — 비로그인 시 로그인 유도 화면 포함
// ─────────────────────────────────────────────

export default function MypageScreen() {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return (
      <ScreenWrapper edges={['top']}>
        <View className="flex-1 items-center justify-center gap-y-4 px-8">
          <Ionicons name="person-circle-outline" size={80} color="#ddd" />
          <Text className="text-lg font-semibold text-[#1a1a1a]">로그인이 필요해요</Text>
          <Text className="text-sm text-[#999] text-center">
            로그인하고 주문내역, 리뷰 등{'\n'}다양한 서비스를 이용해보세요
          </Text>
          <View style={{ width: '100%', marginTop: 8 }}>
            <AppButton
              title="로그인"
              onPress={() => router.push('/auth/login')}
            />
          </View>
          <View style={{ width: '100%' }}>
            <AppButton
              title="회원가입"
              variant="outline"
              onPress={() => router.push('/auth/signup')}
            />
          </View>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper edges={['top']}>
      <MypageContent />
    </ScreenWrapper>
  )
}
