import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getProductReviews, getReviewStats } from '@/src/api/productApi'
import { Review, ReviewStats } from '@/src/types'
import { Colors } from '@/src/constants/colors'

interface Props {
  productId: number
}

// ─────────────────────────────────────────────
// 별점 표시 컴포넌트
// ─────────────────────────────────────────────
const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color="#f59e0b"
        />
      ))}
    </View>
  )
}

// ─────────────────────────────────────────────
// 별점 분포 바 컴포넌트
// ─────────────────────────────────────────────
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const ratio = total > 0 ? count / total : 0

  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{star}점</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { flex: ratio }]} />
        <View style={{ flex: 1 - ratio }} />
      </View>
      <Text style={styles.ratingBarCount}>{count}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────
// 리뷰 카드 컴포넌트
// ─────────────────────────────────────────────
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <View style={styles.reviewCard}>

      {/* 작성자 + 별점 + 날짜 */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {review.memberName?.slice(0, 1) ?? '?'}
          </Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{review.memberName}</Text>
          <View style={styles.reviewRatingRow}>
            <StarRating rating={review.rating} size={12} />
            <Text style={styles.reviewDate}>
              {review.createdAt?.slice(0, 10)}
            </Text>
          </View>
        </View>
      </View>

      {/* 리뷰 내용 */}
      <Text style={styles.reviewContent}>{review.content}</Text>

      {/* 리뷰 이미지 (있을 경우만 표시) */}
      {!!review.imageUrl && (
        <Image
          source={{ uri: review.imageUrl }}
          style={styles.reviewImage}
          resizeMode="cover"
        />
      )}

    </View>
  )
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
const ProductReviewTab = ({ productId }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'latest' | 'high' | 'low'>('latest')

  // 정렬된 리뷰 목록
  const sortedReviews = useMemo(() => {
    const copy = [...reviews]
    if (sort === 'latest') return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'high')   return copy.sort((a, b) => b.rating - a.rating)
    if (sort === 'low')    return copy.sort((a, b) => a.rating - b.rating)
    return copy
  }, [reviews, sort])

  // ─────────────────────────────────────────────
  // 리뷰 + 통계 동시 조회
  // ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [reviewData, statsData] = await Promise.all([
          getProductReviews(productId),
          getReviewStats(productId),
        ])

        const safeReviews = Array.isArray(reviewData) ? reviewData : []

        // ratingDistribution 프론트에서 직접 계산
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        safeReviews.forEach((r) => {
          const rounded = Math.round(r.rating)
          if (rounded >= 1 && rounded <= 5) {
            distribution[rounded] = (distribution[rounded] ?? 0) + 1
          }
        })

        setReviews(safeReviews)
        setStats(statsData ? { ...statsData, ratingDistribution: distribution } : null)
      } catch (e) {
        console.warn('[ProductReviewTab] 리뷰 조회 실패:', e)
        setReviews([])
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* ── 리뷰 통계 ─────────────────────────── */}
      {stats && (
        <View style={styles.statsBox}>
          {/* 평균 별점 */}
          <View style={styles.avgBox}>
            <Text style={styles.avgNumber}>
              {(stats.avgRating ?? 0).toFixed(1)}
            </Text>
            <StarRating rating={stats.avgRating ?? 0} size={20} />
            <Text style={styles.totalCount}>
              총 {stats.totalCount ?? 0}개 리뷰
            </Text>
          </View>

          {/* 별점 분포 - ratingDistribution이 없을 경우 빈 객체로 대체 */}
          <View style={styles.distBox}>
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={stats.ratingDistribution?.[star] ?? 0}
                total={stats.totalCount ?? 0}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.divider} />
      {/* ── 정렬 버튼 ─────────────────────────── */}
      <View style={styles.sortRow}>
        {([
          { label: '최신순', value: 'latest' },
          { label: '별점 높은순', value: 'high' },
          { label: '별점 낮은순', value: 'low' },
        ] as const).map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSort(option.value)}
            style={[styles.sortBtn, sort === option.value && styles.sortBtnActive]}
          >
            <Text style={[styles.sortBtnText, sort === option.value && styles.sortBtnTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── 리뷰 목록 ─────────────────────────── */}
      {sortedReviews.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="chatbubble-outline" size={40} color="#ddd" />
          <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
          <Text style={styles.emptySubText}>첫 번째 리뷰를 작성해보세요</Text>
        </View>
      ) : (
        sortedReviews.map((review) => (
          <ReviewCard key={review.reviewId} review={review} />
        ))
      )}

    </View>
  )
}

export default ProductReviewTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  // 통계 영역
  statsBox: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  avgBox: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  avgNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  totalCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  // 분포 바
  distBox: {
    flex: 2,
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBarLabel: {
    fontSize: 11,
    color: '#888',
    width: 24,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ratingBarFill: {
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 11,
    color: '#888',
    width: 16,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  // 리뷰 카드
  reviewCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fde8ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  reviewMeta: {
    flex: 1,
    gap: 3,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#aaa',
  },
  reviewContent: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#bbb',
  },
  reviewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
    sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  sortBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#fef2f2',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#888',
  },
  sortBtnTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
})