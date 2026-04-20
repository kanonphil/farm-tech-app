import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Carousel from 'react-native-reanimated-carousel'

//화면 전체 너비 가져오기
const { width } = Dimensions.get('window')

//배너이미지 목록
const banners = [
  { id : '1', source : require('@/assets/images/banner1.png')},
  { id : '2', source : require('@/assets/images/banner2.png')},
  { id : '3', source : require('@/assets/images/banner3.png')},
]
const HomeBanner = () => {
  //현재 보여지는 배너 인덱스 (하단 점 표시용)
  const [currentIndex, setCurrentIndex] = useState(0)



  return (
    <View>
      <Carousel/>
    </View>
  )
}

export default HomeBanner

const styles = StyleSheet.create({})