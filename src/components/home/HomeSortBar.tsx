import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/src/constants/colors'

const SORT_OPTIONS = [
  { label: '기본', value: 'name_asc' },
  { label: '신상품순', value: null },
  { label: '판매량순', value: 'sales_desc' },
  { label: '낮은가격순', value: 'price_asc' },
  { label: '높은가격순', value: 'price_desc' },
]

interface Props {
  onSortChange: (sort: string | null) => void
  productCount: number
}

const HomeSortBar = ({ onSortChange, productCount }: Props) => {
  const [selected, setSelected] = useState<string | null>('name_asc')

  const handlePress = (value: string | null) => {
    setSelected(value)
    onSortChange(value)
  }

  return (
    <View>
      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 섹션 타이틀 */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>전체 상품</Text>
        <Text style={styles.count}>{productCount}개</Text>
      </View>

      {/* 정렬 버튼 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option.label}
            style={[styles.btn, selected === option.value && styles.btnActive]}
            onPress={() => handlePress(option.value)}
          >
            <Text
              style={[styles.btnText, selected === option.value && styles.btnTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

export default HomeSortBar

const styles = StyleSheet.create({
  divider: {
    height: 6,
    backgroundColor: Colors.bgSurface,
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  count: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgWhite,
  },
  btnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  btnText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  btnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
})