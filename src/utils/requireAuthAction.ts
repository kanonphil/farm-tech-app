import { View, Text } from 'react-native'
import React from 'react'
import useAuthStore from '../store/authStore'
import { router } from 'expo-router'

/**
 * 
 */

type RequireAuthActionParams = {
  isLoggedIn: boolean,
  redirectTo?: string,
  message?: string,
}

export default function requireAuthAction({
  isLoggedIn,
  redirectTo,
  message = '로그인이 필요한 서비스입니다.',
}: RequireAuthActionParams) {
  if (isLoggedIn) return true

  const { showToast } = useAuthStore.getState()
  showToast(message)

  if (redirectTo) {
    router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  } else {
    router.push(`/auth/login`)
  }

  return false
}