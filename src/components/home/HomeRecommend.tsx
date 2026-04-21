import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native'
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
    <View>
      <Text>추천 상품 🔥</Text>

      <FlatList 
        data={products}
        keyExtractor={(item) => String(item.productId)}
        horizontal
        show
      />

    </View>
  )
}

export default HomeRecommend

const styles = StyleSheet.create({})