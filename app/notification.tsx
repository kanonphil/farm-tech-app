import React, { useCallback } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import AuthGuard from '@/src/components/auth/AuthGuard'
import useAuthStore from '@/src/store/authStore'
import { markNotificationAsRead } from '@/src/api/notificationApi'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { UserNotification } from '@/src/types'

/**
 * 상대 시간 포맷
 * 예: "방금 점", "5분 전", "2시간 전", "3일 전"
 */
function formatRelativeTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

/** 메시지 내용에 따라 아이콘과 색상 결정 */
function getIconInfo(message: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } {
  if (message.includes('배송')) {
    return { name: 'bicycle-outline', color: '#3b82f6', bg: '#eff6ff' }
  }
  if (message.includes('리뷰') || message.includes('답글')) {
    return { name: 'chatbubble-outline', color: '#8b5cf6', bg: '#f5f3ff' }
  }
  if (message.includes('주문') || message.includes('결제')) {
    return { name: 'receipt-outline', color: '#f59e0b', bg: '#fffbeb' }
  }
  return { name: 'notifications-outline', color: '#6b7280', bg: '#f3f4f6' }
}

/**
 * 알림 목록 화면
 *
 * authStore.notifications 에 이미 로드된 데이터를 표시합니다.
 * (_layout.tsx 에서 앱 시작 시 getUnreadNotifications + SSE 로 채워짐)
 *
 * 알림 탭 시:
 *  1. 서버에 읽음 처리 (PATCH /notifications/{id}/read)
 *  2. 로컬 스토어에서 즉시 제거 (낙관적 업데이트)
 *  3. link 가 있으면 해당 화면으로 이동
 */
export default function NotificationScreen() {
  const notifications = useAuthStore((state) => state.notifications)
  const removeNotification = useAuthStore((state) => state.removeNotification)

  const handlePress = useCallback(async (notification: UserNotification) => {
    // 읽음 처리 실패해도 UI는 제거 - 다음 앱 시작 시 서버에서 재조회 됨
    try {
      await markNotificationAsRead(notification.notificationId)
    } finally {
      removeNotification(notification.notificationId)
    }

    if (notification.link) {
      router.push(notification.link as any)
    }
  }, [removeNotification])
  
  return (
    <AuthGuard redirectTo='/notification'>
      <ScreenWrapper edges={['top']}>
        
        {/* ── 헤더 ────────────────────────────────── */}
        <View 
          className='flex-row items-center border-b border-[#eee] bg-white px-4 py-4'
          style={{ paddingVertical: 24 }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
            className='mr-3'
          >
            <Ionicons name='arrow-back' size={24} color={Colors.textPrimary} />
          </Pressable>

          <Text className='text-base font-bold text-[#1a1a1a]'>알림</Text>

          {notifications.length > 0 && (
            <View className='ml-2 rounded-full bg-primary px-2 py-0.5'>
              <Text className='text-xs font-bold text-white'>{notifications.length}</Text>
            </View>
          )}
        </View>

        {/* ── 빈 상태 ─────────────────────────────── */}
        {notifications.length === 0 ? (
          <View className='flex-1 items-center justify-center gap-3'>
            <View className='rounded-full bg-[#f3f4f6] p-5'>
              <Ionicons name='notifications-off-outline' size={36} color={Colors.textMuted} />
            </View>
            <Text className='text-base font-medium text-[#999]'>새로운 알림이 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.notificationId)}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <NotificationItem notification={item} onPress={handlePress} />
            )}
          />
        )}
      </ScreenWrapper>
    </AuthGuard>
  )
}

// ─────────────────────────────────────────────
// 알림 항목 카드
// ─────────────────────────────────────────────

type NotificationItemProps = {
  notification: UserNotification
  onPress: (notification: UserNotification) => void
}

/**
 * 알림 한 줄 카드
 */
function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = getIconInfo(notification.message)
  
  return (
    <Pressable
      onPress={() => onPress(notification)}
      className='mb-2 flex-row items-center rounded-xl bg-white px-4 py-4'
      style={({ pressed }) => [
        pressed && { opacity: 0.75 },
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }
      ]}
    >
      {/* 타입별 아이콘 */}
      <View
        className='mr-3 h-11 w-11 items-center justify-center rounded-full'
        style={{ backgroundColor: icon.bg }}
      >
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>
      
      {/* 메시지 + 시간 */}
      <View className='flex-1'>
        <Text className='text-sm font-medium leading-5 text-[#1a1a1a]'>
          {notification.message}
        </Text>
        <Text className='mt-0.5 text-xs text-[#aaa]'>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>

      {/* link 있을 때만 이동 화살표 표시 */}
      {notification.link ? (
        <Ionicons name='chevron-forward' size={16} color='#ccc' className='ml-2' />
      ) : null}
    </Pressable>
  )
}