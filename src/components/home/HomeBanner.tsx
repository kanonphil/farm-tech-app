import { Dimensions, Image, StyleSheet, View } from 'react-native'
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
      <Carousel
        width={width}
        height={width / 3}
        data={banners}
        autoPlay
        autoPlayInterval={3000}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({item}) => (
          <Image
            source={item.source}
            style={styles.banner}
            resizeMode='cover'
          />
        )}
      />
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  )
}

export default HomeBanner

const styles = StyleSheet.create({
  banner : {
    width : '100%',
    height : width / 3
  },
  dots : {
    flexDirection : 'row',
    justifyContent : 'center',
    alignItems : 'center',
    paddingVertical : 8,
    gap : 6
  },
  dot : {
    width : 6,
    height : 6,
    borderRadius : 3,
    backgroundColor : '#ccc'
  },
  dotActive : {
    backgroundColor : '#e63946',
    width : 16,
    borderRadius : 3
  }
})