import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

import useAuth from '@/src/hooks/useAuth'
import requireAuthAction from '@/src/utils/requireAuthAction'
import { addCartItem, getCartItems, updateCartItemQty } from '@/src/api/cartApi'
import { getProductDetail } from '@/src/api/productApi'
import type { ProductDetail } from '@/src/types'
import useAuthStore from '@/src/store/authStore'
import { Ionicons } from '@expo/vector-icons'
import ProductReviewTab from '@/src/components/product/ProductReviewTab'

/**
 * 상품 상세 페이지
 *
 * - 비회원도 접근 가능
 * - 장바구니 담기 / 바로 구매는 로그인한 회원만 가능
 * - 수량은 최소 1개, 최대 재고(productStock)까지만 선택 가능
 * - 재고가 0개이면 품절 처리
 */

const {width} = Dimensions.get('window')

export default function ProductDetailScreen() {

  //ScrollView 컴포넌트 저장
  const scrollViewRef = useRef<ScrollView>(null)
  //탭 클릭 시 스크롤 숫자값 저장
  const tabContentY = useRef(0)
  //장바구니 담기 시 true
  const [showCartSnack, setShowCartSnack] = useState(false)
  //Animated.value(0) 저장
  const snackAnim = useRef(new Animated.Value(0)).current

  // 탭 상태 (상품설명, 리뷰)
  const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc')

  //이미지 슬라이드 인덱스
  const [imgIndex, setImgIndex] = useState(0)
  
  /**
   * URL 파라미터에서 상품 ID를 가져옵니다.
   * 예: /product/42 -> id = '42'
   */
  const { id } = useLocalSearchParams<{ id: string }>()

  /**
   * 로그인 상태 확인
   */
  const { isLoggedIn } = useAuth()

  /**
   * 문자열 ID를 숫자로 변환합니다.
   */
  const productId = Number(id)

  /**
   * 상품 상세 데이터 상태
   */
  const [product, setProduct] = useState<ProductDetail | null>(null)

  /**
   * 로딩 / 에러 상태
   */
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * 사용자가 선택한 수량
   * 기본값은 1개입니다.
   */
  const [cnt, setCnt] = useState(1)

  //이미지 
  const [detailImgRatio, setDetailImgRatio] = useState(1)

  const showToast = useAuthStore((state) => state.showToast)

  /**
   * 상품 상세 조회
   *
   * - 유효한 상품 ID인지 먼저 확인
   * - 성공 시 상품 상세 데이터를 상태에 저장
   * - 실패 시 에러 메시지 저장
   */
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (Number.isNaN(productId)) {
        setErrorMessage('유효하지 않은 상품입니다.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getProductDetail(productId)
        setProduct(data)


        /**
         * 혹시 기존 cnt가 재고보다 크면 재고 수량에 맞춰 보정합니다.
         * 예: 재고 2개인데 cnt가 5로 남아 있던 경우
         */
        if (data.productStock <= 0) {
          setCnt(1)
        } else {
          setCnt((prev) => Math.min(Math.max(prev, 1), data.productStock))
        }
      } catch (error) {
        setErrorMessage('상품 정보를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductDetail()
  }, [productId])

  /**
   * 로딩 중 표시
   */
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-base text-gray-500">
          상품 정보를 불러오는 중입니다.
        </Text>
      </View>
    )
  }

  /**
   * 에러 표시
   */
  if (errorMessage || !product) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-base text-red-500">
          {errorMessage || '상품 정보를 찾을 수 없습니다.'}
        </Text>
      </View>
    )
  }

  // 탭 클릭 시 전환 + 스크롤
  const handleTabPress = (tab: 'desc' | 'review') => {
    setActiveTab(tab)
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: tabContentY.current, animated: true })}, 50)
  }

  // ── 이미지 추출 (imageType 기준) ──────────────────
  const mainImg = product.productImageList.find(img => img.imageType === 'MAIN')

  const subImgs = product.productImageList
    .filter(img => img.imageType === 'SUB')
    .sort((a, b) => a.imageOrder - b.imageOrder)

  const detailImg = product.productImageList.find(img => img.imageType === 'DETAIL')

  // 슬라이드 이미지: MAIN → SUB 순서
  const images = [
    ...(mainImg ? [mainImg.imageSavedName] : []),
    ...subImgs.map(img => img.imageSavedName),
  ]

  /**
   * 현재 상품 재고
   */
  const stock = product.productStock

  /**
   * 품절 여부
   */
  const isSoldOut = stock <= 0

  /**
   * 수량 감소
   * 최소 1개 미만으로 내려가지 않도록 제한합니다.
   */
  const handleDecreaseCnt = () => {
    setCnt((prev) => Math.max(1, prev - 1))
  }

  /**
   * 수량 증가
   * 재고 수량(productStock)을 초과하지 않도록 제한합니다.
   */
  const handleIncreaseCnt = () => {
    if (cnt >= stock) {
      showToast('최대 구매 수량입니다.')
      return
    }

    setCnt((prev) => Math.min(stock, prev + 1))
  }

  /**
   * 장바구니 담기
   *
   * - 품절 여부 확인
   * - 선택 수량이 재고를 초과하는지 확인
   * - 로그인 여부 확인
   * - 장바구니 추가 API 호출
   */
  const handleAddToCart = async () => {
    if (isSoldOut) {
      showToast('품절된 상품입니다.')
      return
    }

    if (cnt > stock) {
      showToast('재고 수량을 초과했습니다.')
      return
    }

    const canProceed = requireAuthAction({
      isLoggedIn,
      redirectTo: `/product/${id}`,
      message: '장바구니 담기는 로그인 후 이용할 수 있습니다.',
    })

    if (!canProceed) return

    try {
      await addCartItem({
        productId: product.productId,
        cartItemQty : cnt,
      })

      showSnack()
    } catch (error) {
      showToast('장바구니 담기에 실패했습니다.')
    }
  }

  /**
   * 바로 구매
   *
   * - 로그인 여부 확인
   * - 주문/결제 페이지로 이동
   */
  const handleBuyNow = async () => {
    if (isSoldOut) { showToast('품절된 상품입니다.'); return }
    if (cnt > stock) { showToast('재고 수량을 초과했습니다.'); return }

    const canProceed = requireAuthAction({
      isLoggedIn,
      redirectTo: `/product/${id}`,
      message: '구매는 로그인 후 이용할 수 있습니다.',
    })
    if (!canProceed) return

    try {
      // 1. 기존 장바구니 조회
      const cartItems = await getCartItems()
      const existingItem = cartItems.find(item => item.productId === product.productId)

      if (existingItem) {
        // 이미 있으면 수량을 cnt로 덮어씌우기
        await updateCartItemQty({ cartItemId: existingItem.cartItemId, cartItemQty: cnt })
        router.push(`/order/checkout?cartItemIds=${existingItem.cartItemId}`)
      } else {
        // 없으면 새로 추가 후 cartItemId 찾기
        await addCartItem({ productId: product.productId, cartItemQty: cnt })
        const updated = await getCartItems()
        const cartItem = updated.find(item => item.productId === product.productId)
        if (!cartItem) { showToast('주문 처리 중 오류가 발생했습니다.'); return }
        router.push(`/order/checkout?cartItemIds=${cartItem.cartItemId}`)
      }
    } catch {
      showToast('주문 처리 중 오류가 발생했습니다.')
    }
  }

  //스낵바 표시/숨김 함수
  const showSnack = () => {
    setShowCartSnack(true)
    Animated.spring(snackAnim, { toValue: 1, useNativeDriver: true }).start()
    setTimeout(() => {
      Animated.timing(snackAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setShowCartSnack(false)
      })
    }, 3000)
  }


  return (
    <View className="flex-1 bg-white">

      {/* ── 상단 헤더 ── */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Pressable onPress={() => router.back()} className="w-8">
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </Pressable>
        <Text className="text-base font-bold text-gray-900">상품 상세</Text>
        <View className="w-8" />
      </View>

      {/* ── 탭 ── */}
      <View className="flex-row border-b border-gray-200">
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'desc' ? 'border-[#e63946]' : 'border-transparent'}`}
          onPress={() => handleTabPress('desc')}
        >
          <Text className={`text-sm ${activeTab === 'desc' ? 'text-[#e63946] font-bold' : 'text-gray-400'}`}>
            상품설명
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'review' ? 'border-[#e63946]' : 'border-transparent'}`}
          onPress={() => handleTabPress('review')}
        >
          <Text className={`text-sm ${activeTab === 'review' ? 'text-[#e63946] font-bold' : 'text-gray-400'}`}>
            리뷰
          </Text>
        </Pressable>
      </View>
      
      {/* ── 스크롤 영역 ── */}
      <ScrollView  ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* 이미지 슬라이드 */}
        <FlatList
          data={images}
          keyExtractor={(_, i) => String(i)}
          style={{ height : width}}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width)
            setImgIndex(index)
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width, height: width}}
              resizeMode="contain"
            />
          )}
        />

        {/* 이미지 인디케이터 */}
        <View className="flex-row justify-center py-2 gap-1">
          {images.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${i === imgIndex ? 'w-4 bg-[#e63946]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </View>
        {/* 상품 정보 */}
        <View className="px-4 py-3 gap-1">
          <Text className="text-lg font-bold text-gray-900">{product.productName}</Text>
          <Text className="text-xl font-bold text-[#e63946]">{product.productPrice.toLocaleString()}원</Text>
          {isSoldOut ? (
            <Text className="text-sm font-bold text-red-500">품절</Text>
          ) : (
            <Text className="text-sm text-gray-400">재고 {stock}개</Text>
          )}
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 수량 선택 */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-base font-semibold text-gray-900">수량</Text>
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={handleDecreaseCnt}
              disabled={cnt <= 1}
              className={`w-9 h-9 rounded-full border items-center justify-center ${cnt <= 1 ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'}`}
            >
              <Text className="text-lg text-gray-900">-</Text>
            </Pressable>
            <Text className="text-base font-bold text-gray-900 min-w-[24px] text-center">{cnt}</Text>
            <Pressable
              onPress={handleIncreaseCnt}
              disabled={isSoldOut || cnt >= stock}
              className={`w-9 h-9 rounded-full border items-center justify-center ${isSoldOut || cnt >= stock ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'}`}
            >
              <Text className="text-lg text-gray-900">+</Text>
            </Pressable>
          </View>
        </View>

        {/* 총 금액 */}
        <View className="flex-row justify-between items-center px-4 py-4 border-t border-gray-200">
          <Text className="text-base text-gray-500">총 금액</Text>
          <Text className="text-lg font-bold text-gray-900">{(product.productPrice * cnt).toLocaleString()}원</Text>
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 탭 콘텐츠 */}
        <View onLayout={(e) => { tabContentY.current = e.nativeEvent.layout.y}} >
          {activeTab === 'desc' ? (
            <View className="p-4">
              {detailImg?.imageSavedName ? (
                <Image
                  source={{ uri: detailImg.imageSavedName }}
                  style={{ width: width, aspectRatio : detailImgRatio }}
                  resizeMode="contain"
                  onLoad={(e) => {
                    const { width: imgW, height: imgH } = e.nativeEvent.source
                    setDetailImgRatio(imgW / imgH)
                  }}
                />
              ) : (
                <Text className="text-sm text-gray-400 text-center py-10">상품 설명이 없습니다.</Text>
              )}
            </View>
          ) : (
            <ProductReviewTab productId={productId} />
          )}
        </View>

      </ScrollView>

      {/* ── 장바구니 스낵바 ── */}
      {showCartSnack && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            transform: [{
              translateY: snackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [120, 0],
              }),
            }],
          }}
        >
          <View className="bg-gray-900 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <Text className="text-white text-sm">장바구니 담기가 완료되었습니다</Text>
            <Pressable
              onPress={() => {
                setShowCartSnack(false)
                router.push('/(tabs)/cart')
              }}
            >
              <Text className="text-[#e63946] font-bold text-sm ml-3">장바구니 가기</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* ── 하단 고정 버튼 ── */}
      <View className="flex-row px-4 py-3 gap-3 border-t border-gray-200 bg-white">
        <Pressable
          onPress={handleAddToCart}
          disabled={isSoldOut}
          className={`flex-1 py-4 rounded-xl border border-[#e63946] items-center ${isSoldOut ? 'opacity-40' : ''}`}
        >
          <Text className="text-[#e63946] font-bold text-base">장바구니 담기</Text>
        </Pressable>
        <Pressable
          onPress={handleBuyNow}
          disabled={isSoldOut}
          className={`flex-1 py-4 rounded-xl bg-[#e63946] items-center ${isSoldOut ? 'opacity-40' : ''}`}
        >
          <Text className="text-white font-bold text-base">바로 구매</Text>
        </Pressable>
      </View>

    </View>
  )
}