/**
 * 연결 상태 배너 (ConnectionBanner.tsx)
 *
 * IoT 기기 또는 DB 연결 문제가 발생했을 때
 * 화면 상단에 표시하는 경고 배너입니다.
 *
 * 사용 예시:
 *   <ConnectionBanner type="device" />   // 기기 연결 끊김
 *   <ConnectionBanner type="database" /> // DB 연결 끊김
 */

import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

type BannerType = 'device' | 'database'

interface ConnectionBannerProps {
  type: BannerType
}

const BANNER_CONFIG = {
  device: {
    icon: 'wifi-outline'   as const,
    iconColor: '#92400e',  // amber-800
    bg:   'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    message: '기기 연결이 끊어졌습니다. 마지막으로 저장된 값을 불러옵니다.',
  },
  database: {
    icon: 'server-outline' as const,
    iconColor: '#991b1b',  // red-800
    bg:   'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    message: '데이터베이스와 연결이 끊어졌습니다.',
  },
} as const

/**
 * 연결 상태 경고 배너
 */
export default function ConnectionBanner({ type }: ConnectionBannerProps) {
  const config = BANNER_CONFIG[type]

  return (
    <View className={`${config.bg} ${config.border} border-b flex-row items-center gap-2 px-5 py-3`}>
      <Ionicons name={config.icon} size={16} color={config.iconColor} />
      <Text className={`${config.text} text-xs flex-1 leading-5`}>
        {config.message}
      </Text>
    </View>
  )
}