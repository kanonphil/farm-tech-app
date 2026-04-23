import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getProductList, getRecommendedKeywords } from '@/src/api/productApi'
import { ProductListItem } from '@/src/types'
import { Colors } from '@/src/constants/colors'

// 카드 너비 계산 (좌우 패딩 32 + 간격 10)
const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = (screenWidth - 32 - 10) / 2

const search = () => {
  const router = useRouter()
  // 검색창 자동 포커스용 ref
  const inputRef = useRef<TextInput>(null)

  const [keyword, setKeyword] = useState('')         // 입력 중인 검색어
  const [submitted, setSubmitted] = useState('')     // 실제 검색된 키워드 (결과 헤더 표시용)
  const [keywords, setKeywords] = useState<string[]>([])     // 추천 검색어 목록
  const [products, setProducts] = useState<ProductListItem[]>([])  // 검색 결과 상품 목록
  const [loading, setLoading] = useState(false)      // 검색 중 로딩 상태
  const [searched, setSearched] = useState(false)   // 검색 시도 여부 (추천 검색어 ↔ 결과 전환)

  // ─────────────────────────────────────────────
  // 추천 검색어 조회 + 화면 진입 시 자동 포커스
  // ─────────────────────────────────────────────
  useEffect(() => {
    getRecommendedKeywords()
      .then(setKeywords)
      .catch(() => {})
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])
  
  // ─────────────────────────────────────────────
  // 디바운스 검색 (타이핑 멈춘 후 400ms 뒤 자동 검색)
  // ─────────────────────────────────────────────
  useEffect(() => {
    // 키워드 없으면 초기 상태로 복구
    if (!keyword.trim()) {
      setSearched(false)
      setProducts([])
      setSubmitted('')
      return
    }

    // 400ms 후 검색 실행
    const timer = setTimeout(() => {
      handleSearch(keyword)
    }, 400)

    // 다음 타이핑 오면 이전 타이머 취소
    return () => clearTimeout(timer)
  }, [keyword])

  // ─────────────────────────────────────────────
  // 검색 실행
  // ─────────────────────────────────────────────
  const handleSearch = useCallback(async (kw: string) => {
    const trimmed = kw.trim()
    if (!trimmed) return

    setSubmitted(trimmed)
    setSearched(true)
    setLoading(true)

    try {
      const data = await getProductList(null, trimmed)
      setProducts(data)
    } catch (e) {
      console.warn('[SearchScreen] 검색 실패:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // ─────────────────────────────────────────────
  // 검색 초기화 (X 버튼 클릭 시)
  // ─────────────────────────────────────────────
  const handleClear = () => {
    setKeyword('')
    setSubmitted('')
    setSearched(false)
    setProducts([])
    inputRef.current?.focus()
  }

  // 가격 포맷 (숫자 → "45,000원")
  const formatPrice = (price: number) => price.toLocaleString() + '원'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── 헤더 (뒤로가기 + 검색창) ─────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => handleSearch(keyword)}
            placeholder="검색어를 입력하세요"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {/* 입력값 있을 때만 X 버튼 표시 */}
          {keyword.length > 0 && (
            <Pressable onPress={handleClear}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── 추천 검색어 (검색 전에만 표시) ────── */}
      {!searched && (
        <View style={styles.keywordsSection}>
          <Text style={styles.sectionTitle}>추천 검색어</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.keywordsRow}
            keyboardShouldPersistTaps='handled'
          >
            {keywords.map((kw) => (
              <TouchableOpacity
                key={kw}
                style={styles.chip}
                onPress={() => { 
                  setKeyword(kw); 
                  handleSearch(kw) }}
              >
                <Text style={styles.chipText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── 검색 결과 (검색 후에만 표시) ────────── */}
      {searched && (
        <>
          {/* 결과 수 헤더 */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultText}>
              <Text style={styles.resultKeyword}>"{submitted}"</Text>
              {' '}검색 결과{' '}
              <Text style={styles.resultCount}>{products.length}개</Text>
            </Text>
          </View>

          {/* 로딩 */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>

          /* 결과 없음 */
          ) : products.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="search-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
              <Text style={styles.emptySubText}>다른 검색어를 입력해보세요</Text>
            </View>

          /* 상품 그리드 */
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => String(item.productId)}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push(`/product/${item.productId}`)}
                >
                  <Image
                    source={{ uri: item.mainImage }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={2}>{item.productName}</Text>
                    <Text style={styles.cardPrice}>{formatPrice(item.productPrice)}</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </>
      )}

    </SafeAreaView>
  )
}

export default search

const styles = StyleSheet.create({
  // 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  // 검색 입력창 래퍼
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  // 추천 검색어 섹션
  keywordsSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  keywordsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  // 추천 검색어 칩
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  // 검색 결과 헤더
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 13,
    color: '#888',
  },
  resultKeyword: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  resultCount: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  // 로딩 / 빈 결과 중앙 정렬
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#bbb',
  },
  // 상품 그리드
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  // 상품 카드
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  cardInfo: {
    padding: 10,
    gap: 4,
  },
  cardName: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
})