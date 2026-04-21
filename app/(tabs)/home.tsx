import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import HomeHeader from '@/src/components/home/HomeHeader'
import HomeProductGrid from '@/src/components/home/HomeProductGrid'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HomeHeader />
      <HomeProductGrid />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
})