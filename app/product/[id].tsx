import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import useAuth from '@/src/hooks/useAuth'
import requireAuthAction from '@/src/utils/requireAuthAction'
import { addCartItem } from '@/src/api/cartApi'
import { getProductDetail } from '@/src/api/productApi'
import type { ProductDetail } from '@/src/types'
import useAuthStore from '@/src/store/authStore'

/**
 * 상품 상세 페이지
 *
 * - 비회원도 접근 가능
 * - 장바구니 담기 / 바로 구매는 로그인한 회원만 가능
 * - 수량은 최소 1개, 최대 재고(productStock)까지만 선택 가능
 * - 재고가 0개이면 품절 처리
 */
export default function ProductDetailScreen() {
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
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base text-gray-500">
            상품 정보를 불러오는 중입니다.
          </Text>
        </View>
      </ScreenWrapper>
    )
  }

  /**
   * 에러 표시
   */
  if (errorMessage || !product) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Text className="text-base text-red-500">
            {errorMessage || '상품 정보를 찾을 수 없습니다.'}
          </Text>
        </View>
      </ScreenWrapper>
    )
  }

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
        cnt,
      })

      showToast('장바구니에 담았습니다.')
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
  const handleBuyNow = () => {
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
      message: '구매는 로그인 후 이용할 수 있습니다.',
    })

    if (!canProceed) return

    router.push(`/order/checkout?productId=${product.productId}&cnt=${cnt}`)
  }

  return (
    <ScreenWrapper scroll>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-black">
          {product.productName}
        </Text>

        <Text className="mt-2 text-lg font-semibold text-green-700">
          {product.productPrice.toLocaleString()}원
        </Text>

        <Text className="mt-2 text-sm text-gray-400">
          상품 ID: {product.productId}
        </Text>

        <View className="mt-4">
          {isSoldOut ? (
            <Text className="text-sm font-medium text-red-500">품절</Text>
          ) : (
            <Text className="text-sm text-gray-600">
              재고 {stock}개
            </Text>
          )}
        </View>

        <View className="mt-6">
          <Text className="mb-2 text-base font-semibold text-black">
            수량 선택
          </Text>

          <View className="flex-row items-center">
            <Pressable
              onPress={handleDecreaseCnt}
              disabled={cnt <= 1}
              className={`h-10 w-10 items-center justify-center rounded-md border ${
                cnt <= 1 ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'
              }`}
            >
              <Text className="text-lg font-bold text-black">-</Text>
            </Pressable>

            <View className="mx-4 min-w-[48px] items-center">
              <Text className="text-base font-semibold text-black">{cnt}</Text>
            </View>

            <Pressable
              onPress={handleIncreaseCnt}
              disabled={isSoldOut || cnt >= stock}
              className={`h-10 w-10 items-center justify-center rounded-md border ${
                isSoldOut || cnt >= stock
                  ? 'border-gray-200 bg-gray-100'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Text className="text-lg font-bold text-black">+</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-base text-gray-700">총 금액</Text>
          <Text className="mt-1 text-xl font-bold text-black">
            {(product.productPrice * cnt).toLocaleString()}원
          </Text>
        </View>

        <View className="mt-8 flex-row gap-3">
          <Pressable
            onPress={handleAddToCart}
            disabled={isSoldOut}
            className={`flex-1 items-center justify-center rounded-lg px-4 py-4 ${
              isSoldOut ? 'bg-gray-300' : 'bg-gray-200'
            }`}
          >
            <Text className="font-semibold text-black">장바구니 담기</Text>
          </Pressable>

          <Pressable
            onPress={handleBuyNow}
            disabled={isSoldOut}
            className={`flex-1 items-center justify-center rounded-lg px-4 py-4 ${
              isSoldOut ? 'bg-gray-300' : 'bg-green-600'
            }`}
          >
            <Text className="font-semibold text-white">바로 구매</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}