import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'
import { getMyReviews, getUnreviewedItems } from '@/src/api/reviewApi'
import { Review, UnreviewedItem } from '@/src/types'
import { formatPrice } from '@/src/utils/format'
import useAuthStore from '@/src/store/authStore'

function getDateRange(months: number) {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - months)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

/** 별점 표시 */
function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={12}
          color={i <= rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </View>
  )
}

export default function ReviewsScreen() {
  const [tab, setTab]                 = useState<'written' | 'unreviewed'>('written')
  const [reviews, setReviews]         = useState<Review[]>([])
  const [unreviewed, setUnreviewed]   = useState<UnreviewedItem[]>([])
  const [isLoading, setIsLoading]     = useState(false)
  const showToast = useAuthStore((state) => state.showToast)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const { startDate, endDate } = getDateRange(12)
    try {
      const [reviewList, unreviewedList] = await Promise.all([
        getMyReviews(startDate, endDate),
        getUnreviewedItems(startDate, endDate),
      ])
      setReviews(reviewList)
      setUnreviewed(unreviewedList)
    } catch {
      showToast('리뷰 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  const renderReview = ({ item }: { item: Review }) => (
    <View className="bg-white px-4 py-3.5 border-b border-[#f0f0f0]">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-medium text-[#1a1a1a]" numberOfLines={1}>
          {item.productName}
        </Text>
        <Text className="text-xs text-[#bbb]">{item.createdAt?.slice(0, 10)}</Text>
      </View>
      <StarRating rating={item.rating} />
      <Text className="text-sm text-[#555] mt-1.5" numberOfLines={3}>{item.content}</Text>
      {item.status === 'BLINDED' && (
        <View className="mt-1.5 bg-[#fef2f2] px-2 py-1 rounded">
          <Text className="text-xs text-[#ef4444]">AI 블라인드 처리된 리뷰입니다.</Text>
        </View>
      )}
    </View>
  )

  const renderUnreviewed = ({ item }: { item: UnreviewedItem }) => (
    <View className="bg-white px-4 py-3.5 border-b border-[#f0f0f0] flex-row items-center">
      <View className="flex-1">
        <Text className="text-sm font-medium text-[#1a1a1a]" numberOfLines={1}>
          {item.productName}
        </Text>
        <Text className="text-xs text-[#888] mt-0.5">
          {item.orderDate?.slice(0, 10)} · {item.orderItemQty}개 · {formatPrice(item.orderItemPrice)}
        </Text>
      </View>
      <Pressable
        className="ml-3 px-3 py-1.5 rounded-full border"
        style={({ pressed }) => [
          pressed && { opacity: 0.7 },
          { borderColor: Colors.primary },
        ]}
        onPress={() => showToast('리뷰 작성 화면은 준비 중입니다.')}
      >
        <Text style={{ color: Colors.primary }} className="text-xs font-medium">
          리뷰 작성
        </Text>
      </Pressable>
    </View>
  )

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
        <Text className="text-base font-bold text-[#1a1a1a]">내 리뷰</Text>
      </View>

      {/* 탭 */}
      <View className="flex-row bg-white border-b border-[#eee]">
        {(['written', 'unreviewed'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
            className="flex-1 py-3 items-center"
          >
            <Text
              className="text-sm font-medium"
              style={{ color: tab === t ? Colors.primary : '#888' }}
            >
              {t === 'written' ? `작성한 리뷰 (${reviews.length})` : `미작성 리뷰 (${unreviewed.length})`}
            </Text>
            {tab === t && (
              <View
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: Colors.primary }}
              />
            )}
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : tab === 'written' ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.reviewId)}
          renderItem={renderReview}
          className="bg-[#f5f5f5]"
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className="text-sm text-[#bbb]">작성한 리뷰가 없습니다</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={unreviewed}
          keyExtractor={(item) => String(item.orderItemId)}
          renderItem={renderUnreviewed}
          className="bg-[#f5f5f5]"
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className="text-sm text-[#bbb]">작성 가능한 리뷰가 없습니다</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  )
}