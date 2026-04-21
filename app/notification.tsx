import React, { useCallback } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
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
    } catch (error) {
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
        <View className='flex-row items-center border-b border-[#eee] bg-white px-4 py-3'>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className='mr-3'
          >
            <Ionicons name='arrow-back' size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text>알림</Text>

          {/* 읽지 않은 알림 수 뱃지 */}
          {notifications.length > 0 && (
            <View className='ml-2 rounded-full bg-primary px-2 py-0.5'>
              <Text className='text-xs font-bold text-white'>{notifications.length}</Text>
            </View>
          )}
        </View>

        {/* ── 빈 상태 ─────────────────────────────── */}
        {notifications.length === 0 ? (
          <View className='flex-1 items-center justify-center'>
            <Ionicons name='notifications-off-outline' size={48} color={Colors.textMuted} />
            <Text>새로운 알림이 없습니다.</Text>
          </View>
        ) : (
          // 알림 목록
          <FlatList 
            data={notifications}
            keyExtractor={(item) => String(item.notificationId)}
            renderItem={({ item }) => ()}
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
  notification: Notification
  onPress: (notification: Notification) => void
}

/**
 * 알림 한 줄 카드
 * 읽지 않은 알림 표시 (파란 점) + 메시지 + 상대 시간
 * link 가 있으면 우측에 chevron 아이콘 표시
 */
function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className='flex-row items-start border-b border-[#f0f0f0] bg-white px-4 py-4'
      activeOpacity={0.7}
    >
      {/* 읽지 않음 표시 점 */}
      <View className='mr-3 mt-1.5 h-2 w-2 rounded-full bg-primary' />
      
      <View className='flex-1'>
        <Text className='text-sm leading-5 text-[#1a1a1a]'>{notification.message}</Text>
        <Text className='mt-1 text-xs text-[#999]'>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>

      {/* link 있을 때만 이동 화살표 표시 */}
      {notification.link ? (
        <Ionicons name='chevron-forward' size={16} color={Colors.textMuted} className='ml-2 mt-0.5' />
      ) : null}
    </TouchableOpacity>
  )
}