import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/src/constants/colors'

//정렬 옵션 목록
const SORT_OPTIONS = [
  { label: '기본', value: null },
  { label: '판매량순', value: 'sales_desc' },
  { label: '낮은가격순', value: 'price_asc' },
  { label: '높은가격순', value: 'price_desc' },
]

//부모에서 정렬 변경 시 실행할 함수를 props로 받음
interface Props {
  onSortChange : (sort : string | null) => void
}

const HomeSortBar = ({ onSortChange } : Props) => {
  //현재 선택된 정렬 값
  const [selected, setSelected] = useState<string | null>(null)

  const handlePress = (value : string | null) => {
    setSelected(value)
    onSortChange(value)
  }



  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SORT_OPTIONS.map((option) => (
        <Pressable
          key={option.label}
          style={[styles.btn, selected === option.value && styles.btnActive]}
          onPress={()=>handlePress(option.value)}
        >
          <Text
            style={[styles.btnText, selected === option.value && styles.btnTextActive]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

export default HomeSortBar

const styles = StyleSheet.create({
  container : {
    flexDirection : 'row',
    paddingHorizontal : 12,
    paddingVertical : 10,
    gap : 8,
    alignItems : 'flex-start'
  },
  btn : {
    paddingHorizontal : 14,
    paddingVertical : 6,
    borderRadius : 20,
    borderWidth : 1,
    borderColor : Colors.border,
    backgroundColor : Colors.bgWhite
  },
  btnActive : {
    backgroundColor : Colors.primary,
    borderColor : Colors.primary
  },
  btnText : {
    fontSize : 13,
    color : Colors.textSecondary
  },
  btnTextActive : {
    color : '#fff',
    fontWeight : 'bold'
  }
})