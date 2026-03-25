import '../global.css'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'
import { isLoggedIn, getStoredProfile } from '../lib/auth'

export default function RootLayout() {
  useEffect(() => {
    async function checkAuth() {
      const loggedIn = await isLoggedIn()
      if (loggedIn) {
        const profile = await getStoredProfile()
        if (profile?.role === 'admin') {
          router.replace('/admin')
        } else {
          router.replace('/(tabs)/explorar')
        }
      } else {
        router.replace('/(auth)/login')
      }
    }
    checkAuth()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notificaciones" />
        <Stack.Screen name="registro-proveedora" />
        <Stack.Screen name="proveedora/[id]" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </GestureHandlerRootView>
  )
}
