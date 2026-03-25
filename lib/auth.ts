import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from './api'

export type UserProfile = {
  id: string
  fullName: string
  email: string
  whatsapp?: string
  city?: string
  avatarUrl?: string
  role: 'usuaria' | 'proveedora' | 'admin'
  verificationStatus: 'pending' | 'in_review' | 'approved' | 'rejected'
}

export async function saveAuth(token: string, profile: UserProfile) {
  await AsyncStorage.multiSet([
    ['mora_token', token],
    ['mora_profile', JSON.stringify(profile)],
  ])
}

export async function getStoredProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem('mora_profile')
  return raw ? JSON.parse(raw) : null
}

export async function logout() {
  await AsyncStorage.multiRemove(['mora_token', 'mora_profile'])
}

export async function updateStoredProfile(updates: Partial<UserProfile>) {
  const current = await getStoredProfile()
  if (current) {
    await AsyncStorage.setItem('mora_profile', JSON.stringify({ ...current, ...updates }))
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await AsyncStorage.getItem('mora_token')
  return !!token
}
