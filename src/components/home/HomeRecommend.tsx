import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ProductListItem } from '@/src/types'
import { getProductList } from '@/src/api/productApi'
import { Colors } from '@/src/constants/colors'
import { FlatList } from 'react-native-gesture-handler'

//화면 전체 넓이
const { width } = Dimensions.get('window')

//추천 상품 하나의 넓이
const CARD_WIDTH = width * 0.45



const HomeRecommend = () => {
  const router = useRouter()

  //추천 상품 목록
  const [products, setProducts] = useState<ProductListItem[]>([])
  //로딩 상태
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    //판매랑순으로 상품조회
    getProductList('sales_desc')
    .then((data) => {
      setProducts(data.slice(0, 6))
    })
    .catch((e) => console.warn('[HomeRecommend] 상품 조회 실패:', e))
    .finally(() => setLoading(false))
  }, [])

  const formatPrice = (price : number) => price.toLocaleString() + '원'

  if(loading) {
    return(
      <View>
        <ActivityIndicator color={Colors.primary}/>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles
        .title
      }>추천 상품 🔥</Text>

      <FlatList 
        data={products}
        keyExtractor={(item) => String(item.productId)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({item}) => (
          <Pressable
            style={styles.card}
            onPress={()=>router.push(`/product/${item.productId}`)}
          >
            <Image
              source={{uri : item.mainImage}}
              style={styles.image}
              resizeMode='contain'
            />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.productName}</Text>
              <Text style={styles.price}>{formatPrice(item.productPrice)}</Text>
            </View>
          </Pressable>
        )}
      />

    </View>
  )
}

export default HomeRecommend

const styles = StyleSheet.create({
  container : {
    marginVertical : 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgWhite,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,  // 정사각형
  },
  info: {
    padding: 10,
    gap: 4,
  },name: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  loadingBox: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
})