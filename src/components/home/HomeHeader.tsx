import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import useAuthStore from '@/src/store/authStore'
import { Colors } from '@/src/constants/colors'
import { Ionicons } from '@expo/vector-icons'

const HomeHeader = () => {
  const router = useRouter()
  const notifications = useAuthStore((state) => state.notifications)
  const cartCount = useAuthStore((state) => state.cartCount)

  // 읽지 않은 알림이 1개 이상이면 true
  const hasUnread = notifications.length > 0
  //로고 이미지 불러오기
  const logoImg = require('@/assets/images/logo.png')

  return (
    <View style={styles.container}>
      <Image 
        source={logoImg}
        style={styles.logo}
        resizeMode='contain'
      />
      <Pressable 
        style={styles.searchBox}
        onPress={()=>router.push('/search')}  
      >
        <Ionicons 
          name='search-outline' 
          size={16}
          color={Colors.textMuted}  
        />
        <Text style={styles.searchText}>
          검색어를 입력하세요
        </Text>
      </Pressable>
      <View style={styles.icons}>
        <Pressable
          onPress={() => router.push('/notification')}
          style={styles.iconBtn}
        >
          <Ionicons 
            name="notifications-outline" 
            size={24}
            color={Colors.textPrimary}
          />
          {hasUnread && <View style={styles.badge}/>}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.iconBtn}
        >
          <Ionicons 
            name="cart-outline" 
            size={24}
            color={Colors.textPrimary}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>)}
        </Pressable>



      </View>
    </View>
  )
}

export default HomeHeader

const styles = StyleSheet.create({
  container : {
    flexDirection : 'row',
    alignItems : 'center',
    paddingHorizontal : 12,
    paddingVertical : 10,
    backgroundColor : Colors.bgWhite,
    borderBottomWidth : 1,
    borderBottomColor : Colors.border,
    gap : 8
  },
  logo: {
    width: 80,   // 원하는 크기로 조절
    height: 40,
    flexShrink: 0,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  searchText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  iconBtn : {
    padding : 4,
    position : 'relative'
  },
  badge: {
    position: 'absolute',  
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,  
    backgroundColor: Colors.primary,
  },
  cartBadge : {
    position : 'absolute',
    top : 0,
    right : 0,
    backgroundColor : Colors.primary,
    borderRadius : 8,
    minWidth : 16,
    height : 16,
    justifyContent : 'center',
    alignItems : 'center',
    paddingHorizontal : 3,
  },
  cartBadgeText : {
    color : '#fff',
    fontSize : 10,
    fontWeight : 'bold'
  }
})