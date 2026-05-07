import React, { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Colors } from '@/src/constants/colors'
import { createReview } from '@/src/api/reviewApi'
import useAuthStore from '@/src/store/authStore'
import AppButton from '@/src/components/common/AppButton'

/**
 * 리뷰 작성 화면
 *
 * 진입 params:
 *   orderItemId  - 주문 상품 ID
 *   productId    - 상품 ID
 *   productName  - 상품명 (헤더 표시용)
 */
export default function WriteReviewScreen() {
  const { orderItemId, productId, productName } = useLocalSearchParams<{
    orderItemId: string
    productId: string
    productName: string
  }>()

  const showToast = useAuthStore((state) => state.showToast)

  const [rating, setRating]             = useState(0)
  const [content, setContent]           = useState('')
  const [imageUri, setImageUri]         = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingLabels = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요']

  // ── 이미지 선택 ───────────────────────────────
  /**
   * 갤러리에서 이미지를 선택합니다.
   * 권한이 없으면 토스트를 표시하고 종료합니다.
   * 선택된 이미지의 로컬 URI를 imageUri 상태에 저장합니다.
   */
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showToast('사진 접근 권한이 필요합니다.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // MediaTypeOptions 대신 MediaType 사용
      allowsEditing: true,  // 이미지 자르기 허용
      aspect: [1, 1],       // 정사각형 비율로 자르기
      quality: 0.7,         // 70% 품질로 압축 (용량 절감)
    })

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri)
    }
  }

  // ── 리뷰 제출 ─────────────────────────────────
  /**
   * 별점·내용 유효성 검사 후 리뷰를 서버에 등록합니다.
   * 이미지가 있으면 multipart/form-data로 함께 전송합니다.
   * 성공 시 이전 화면(미작성 리뷰 목록)으로 돌아갑니다.
   */
  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('별점을 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await createReview(
        {
          orderItemId: Number(orderItemId),
          productId:   Number(productId),
          rating,
          content: content.trim(),
        },
        imageUri ?? undefined  // 이미지 없으면 undefined → 서버에서 imgFile 무시
      )
      showToast('리뷰가 작성되었습니다.')
      router.back()
    } catch {
      showToast('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    /**
     * edges={['top', 'bottom']}:
     * 상단 노치 + 하단 홈 인디케이터 영역 모두 safe area 적용
     */
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }} edges={['top', 'bottom']}>

      {/* ── 헤더 ──────────────────────────────── */}
      <View className="flex-row items-center border-b border-[#eee] bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text className="text-base font-bold text-[#1a1a1a]">리뷰 작성</Text>
      </View>

      {/**
       * KeyboardAvoidingView:
       * 키보드가 올라올 때 콘텐츠를 밀어 올립니다.
       * iOS는 'padding', Android는 'height' 방식이 자연스럽습니다.
       */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/**
         * ScrollView:
         * style={{ flex: 1 }} — ScrollView 자체가 남은 공간을 차지하도록 명시합니다.
         * 이렇게 해야 하단 등록 버튼이 ScrollView 밖에서 항상 보입니다.
         * contentContainerStyle={{ flexGrow: 1 }} — 콘텐츠가 짧을 때도
         * 내부 컨테이너가 ScrollView 높이만큼 늘어납니다.
         */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── 구매 상품명 ───────────────────────── */}
          <View className="bg-white px-4 py-4 border-b border-[#f0f0f0]">
            <Text className="text-xs text-[#888] mb-1">구매 상품</Text>
            <Text className="text-sm font-medium text-[#1a1a1a]" numberOfLines={2}>
              {productName ?? '상품'}
            </Text>
          </View>

          <View className="h-2 bg-[#f0f0f0]" />

          {/* ── 별점 선택 ─────────────────────────── */}
          <View className="bg-white px-4 py-5 border-b border-[#f0f0f0] items-center">
            <Text className="text-sm font-semibold text-[#1a1a1a] mb-3">
              이 상품은 어떠셨나요?
            </Text>

            {/* 별 아이콘 — 누르면 해당 별점으로 설정 */}
            <View className="flex-row gap-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? '#f59e0b' : '#d1d5db'}
                  />
                </Pressable>
              ))}
            </View>

            {/* 별점 텍스트 라벨 (선택 시에만 표시) */}
            {rating > 0 && (
              <Text className="mt-2 text-xs font-medium" style={{ color: '#f59e0b' }}>
                {ratingLabels[rating]}
              </Text>
            )}
          </View>

          <View className="h-2 bg-[#f0f0f0]" />

          {/* ── 리뷰 내용 입력 ────────────────────── */}
          <View className="bg-white px-4 pt-4 pb-2">
            <Text className="text-sm font-semibold text-[#1a1a1a] mb-2">리뷰 내용</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="상품에 대한 솔직한 리뷰를 남겨주세요."
              placeholderTextColor="#bbb"
              multiline
              maxLength={500}
              style={{
                minHeight: 140,
                textAlignVertical: 'top',  // Android: 텍스트를 상단 정렬
                fontSize: 14,
                color: '#1a1a1a',
                lineHeight: 22,
                padding: 12,
                backgroundColor: '#f9f9f9',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#eee',
              }}
            />
            {/* 글자 수 카운터 */}
            <Text className="text-right text-xs text-[#bbb] mt-1.5 mb-2">
              {content.length}/500
            </Text>
          </View>

          <View className="h-2 bg-[#f0f0f0]" />

          {/* ── 사진 첨부 ─────────────────────────── */}
          <View className="bg-white px-4 py-4">
            <Text className="text-sm font-semibold text-[#1a1a1a] mb-3">
              사진 첨부{' '}
              <Text className="text-xs font-normal text-[#aaa]">(선택)</Text>
            </Text>

            <View className="flex-row gap-x-3">

              {/* 사진 미선택 상태 — 추가 버튼 표시 */}
              {!imageUri && (
                <Pressable
                  onPress={handlePickImage}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    className="items-center justify-center rounded-xl border border-dashed border-[#ddd]"
                    style={{ width: 80, height: 80, backgroundColor: '#f9f9f9' }}
                  >
                    <Ionicons name="camera-outline" size={24} color="#bbb" />
                    <Text className="text-[10px] text-[#bbb] mt-1">사진 추가</Text>
                  </View>
                </Pressable>
              )}

              {/* 사진 선택 후 — 미리보기 + 삭제/변경 버튼 */}
              {imageUri && (
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: 80, height: 80, borderRadius: 10 }}
                  />

                  {/* X 버튼 — 선택 이미지 제거 */}
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: '#333',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </Pressable>

                  {/* 하단 변경 버튼 — 다른 이미지 선택 */}
                  <Pressable
                    onPress={handlePickImage}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                      paddingVertical: 3,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10 }}>변경</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

        </ScrollView>

        {/* ── 등록 버튼 ─────────────────────────── */}
        {/**
         * ScrollView 밖, KeyboardAvoidingView 안에 배치합니다.
         * ScrollView에 style={{ flex: 1 }}을 명시했기 때문에
         * 버튼이 항상 화면 하단에 고정되어 보입니다.
         */}
        {/* ── 등록 버튼 ─────────────────────────── */}
        <View className="px-4 py-4">
          <AppButton
            title="리뷰 등록"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={{ width: '100%' }}
          />
        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  )
}