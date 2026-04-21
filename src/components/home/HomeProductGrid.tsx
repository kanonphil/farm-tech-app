import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import HomeBanner from '@/src/components/home/HomeBanner'
import HomeRecommend from '@/src/components/home/HomeRecommend'
import HomeSortBar from '@/src/components/home/HomeSortBar'
import { getProductList } from '@/src/api/productApi'
import { ProductListItem } from '@/src/types'
import { Colors } from '@/src/constants/colors'
import { Dimensions } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = (screenWidth - 32 - 10) / 2  // 좌우패딩 32 + 간격 10

const HomeProductGrid = () => {
  const router = useRouter()
  const [sort, setSort] = useState<string | null>('name_asc')
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async (sortValue: string | null) => {
    setLoading(true)
    try {
      const isFrontendSort = sortValue === 'name_asc'
      const data = await getProductList(isFrontendSort ? null : sortValue)
      if (isFrontendSort) {
        setProducts([...data].sort((a, b) =>
          a.productName.localeCompare(b.productName, 'ko')
        ))
      } else {
        setProducts(data)
      }
    } catch (e) {
      console.warn('[HomeProductGrid] 상품 조회 실패:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts(sort)
  }, [sort, loadProducts])

  const listHeader = useMemo(() => (
    <>
      <HomeBanner />
      <HomeRecommend />
      <HomeSortBar onSortChange={setSort} productCount={products.length} />
    </>
  ), [products.length])

  const formatPrice = (price: number) => price.toLocaleString() + '원'


  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.productId)}
      numColumns={2}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>상품이 없습니다.</Text>
          </View>
        )
      }
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
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.price}>{formatPrice(item.productPrice)}</Text>
          </View>
        </Pressable>
      )}
    />
  )
}

export default HomeProductGrid

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  centerBox: {
    flex: 1,
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    width: CARD_WIDTH,   // flex: 1 대신 고정 너비
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
})