import AuthGuard from '@/src/components/auth/AuthGuard'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import { Colors } from '@/src/constants/colors'
import useCart from '@/src/hooks/useCart'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import CartItemCard from '@/src/components/cart/CartItem'
import CartSummary from '@/src/components/cart/CartSummary'

/**
 * 장바구니 화면
 * 
 * 흐름:
 *   1. 화면 진입 시 useFocusEffect로 장바구니 조회
 *   2. 체크박스로 상품 선택 -> 합계 금액 실시간 계산
 *   3. 주문하기 클릭 -> 선택된 항목 ID를 params로 넘겨 checkout 이동
 */
export default function CartScreen() {
  const { cartItems, isLoading, error, fetchCart, updateQty, deleteItems } = useCart()

  /**
   * 선택된 cartItemId 집합
   * 배열 대신 Set을 쓰는 이유:
   *  - has() 조회가 O(1) (배열은 O(n)) 
   *  - 중복 선택 자동 방지
   */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // ─────────────────────────────────────────────
  // 화면 포커스 시 장바구니 조회
  // ─────────────────────────────────────────────

  /**
   * useFocusEffect: 이 화면이 포커스될 때마다 실행됩니다.
   * useEffect와 달리 다른 화면에서 뒤로가기로 돌아왔을 때도 실행됩니다.
   * 예: 상품 상세에서 장바구니 담고 돌아오면 목록이 자동 갱신됩니다.
   *
   * cleanup 함수(return): 화면을 떠날 때 선택 상태를 초기화합니다.
   */
  useFocusEffect(
    useCallback(() => {
      fetchCart()
      return () => setSelectedIds(new Set())
    }, [fetchCart])
  )

  // ─────────────────────────────────────────────
  // 선택 관련 핸들러
  // ─────────────────────────────────────────────

  /** 전체 선택 여부 */
  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length

  /**
   * 개별 체크박스 토글
   * Set은 불변 업데이트가 필요해서 new Set(prev)로 복사 후 수정
   */
  const handleSelect = useCallback((cartItemId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(cartItemId) ? next.delete(cartItemId) : next.add(cartItemId)
      return next
    })
  }, [])

  /** 전체 선택 / 전체 해제 토글 */
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(cartItems.map((item) => item.cartItemId)))
    }
  }, [isAllSelected, cartItems])

  /** 선택된 항목 일괄 삭제 */
  const handleDeleteSelected = useCallback(async () => {
    await deleteItems(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [selectedIds, deleteItems])

  /** 개별 항목 삭제 (X 버튼) */
  const handleDeleteOne = useCallback(
    async (cartItemId: number) => {
      await deleteItems([cartItemId])
      // 삭제된 항목이 선택되어 있었다면 선택 목록에서도 제거
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(cartItemId)
        return next
      })
    }, [deleteItems]
  )

  // ─────────────────────────────────────────────
  // 금액 계산
  // ─────────────────────────────────────────────

  /**
   * 선택된 상품들의 합산 금액
   * filter로 선택된 항목만 걸러내고, reduce로 합산합니다.
   */
  const totalPrice = cartItems
    .filter((item) => selectedIds.has(item.cartItemId))
    .reduce((sum, item) => sum + item.product.productPrice * item.cartItemQty, 0)

  // ─────────────────────────────────────────────
  // 주문하기
  // ─────────────────────────────────────────────

  /**
   * 선택된 cartItemId 목록을 query param으로 넘겨 결제 화면으로 이동합니다.
   * checkout 화면에서 useLocalSearchParams()로 받아 사용합니다.
   *
   * 예: /order/checkout?cartItemIds=1,3,5
   */
  const handleCheckout = useCallback(() => {
    const ids = Array.from(selectedIds).join(',')
    router.push(`/order/checkout?cartItemIds=${ids}`)
  }, [selectedIds])

  // ─────────────────────────────────────────────
  // 렌더링 분기
  // ─────────────────────────────────────────────

  if (isLoading) return <LoadingSpinner full />

  if (error) {
    return (
      <ScreenWrapper edges={[ 'top' ]}>
        <View className='flex-1 items-center justify-center'>
          <Text className='text-base text-[#999]'>{error}</Text>
        </View>
      </ScreenWrapper>
    )
  }

  if (cartItems.length === 0) {
    return (
      <ScreenWrapper edges={[ 'top' ]}>
        <View className='flex-1 items-center justify-center'>
          <Ionicons name='cart-outline' size={48} color={Colors.textMuted} />
          <Text className='text-base text-[#999]'>장바구니가 비어있습니다.</Text>
        </View>
      </ScreenWrapper>
    )
  }
  
  return (
    // AuthGuard는 로그인 구현 전까지 주석 처리 후 개발, 완성 후 해제
    // <AuthGuard redirectTo='/(tabs)/cart'>
      <ScreenWrapper edges={['top']}>

        {/* ── 상단 선택/삭제 바 ──────────────────── */}
        <View className='flex-row items-center justify-between border-b border-[#eee] bg-white px-4 py-2'>
          {/* 전체선택 체크박스 */}
          <TouchableOpacity
            onPress={handleSelectAll}
            className='flex-row items-center'
          >
            <Ionicons 
              name={isAllSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={isAllSelected ? Colors.primary : Colors.textMuted}
            />
            <Text className='ml-2 text-sm text-[#555]'>
              전체선택 ({selectedIds.size}/{cartItems.length})
            </Text>
          </TouchableOpacity>

          {/* 선택삭제 — 선택된 항목이 있을 때만 표시 */}
          {selectedIds.size > 0 && (
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Text className="text-sm text-[#999]">선택삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 장바구니 목록 ──────────────────────── */}
        {/**
         * FlatList: 긴 목록을 성능 좋게 렌더링합니다.
         * ScrollView와 달리 화면 밖 항목을 메모리에서 해제하고
         * 보이는 항목만 렌더링해서 메모리를 아낍니다.
         */}
        <FlatList 
          data={cartItems}
          keyExtractor={(item) => String(item.cartItemId)}
          renderItem={({ item }) => (
            <CartItemCard 
              item={item}
              isSelected={selectedIds.has(item.cartItemId)}
              onSelect={handleSelect}
              onQtyChange={updateQty}
              onDelete={handleDeleteOne}
            />
          )}
        />

        {/* ── 하단 결제 요약 ─────────────────────── */}
        <CartSummary
          selectedCount={selectedIds.size}
          totalPrice={totalPrice}
          onCheckout={handleCheckout}
        />

      </ScreenWrapper>
    // </AuthGuard>
  )
}
