import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.78.121:3000'

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('mora_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en el servidor')
  return data
}

export const api = {
  // Auth
  register: (body: { fullName: string; email: string; password: string; whatsapp?: string; city?: string; role?: string }) =>
    request<{ token: string; profile: any }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; profile: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<{ profile: any }>('/api/auth/me'),

  updateProfile: (body: { fullName?: string; whatsapp?: string; city?: string; avatarUrl?: string }) =>
    request<{ profile: any }>('/api/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Providers
  getProviders: (params?: { category?: string; serviceMode?: string; city?: string; minRating?: string; maxPrice?: string; search?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return request<{ providers: any[] }>(`/api/providers${qs}`)
  },

  getProvider: (id: string) => request<{ provider: any }>(`/api/providers/${id}`),

  // Provider profile
  getMyProviderProfile: () => request<{ profile: any }>('/api/provider-profile'),
  createProviderProfile: (body: any) => request<{ profile: any }>('/api/provider-profile', { method: 'POST', body: JSON.stringify(body) }),
  updateProviderProfile: (body: any) => request<{ profile: any }>('/api/provider-profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Reviews
  getReviews: (providerId: string) => request<{ reviews: any[] }>(`/api/reviews/${providerId}`),
  createReview: (providerId: string, body: { rating: number; comment?: string }) =>
    request<{ review: any }>(`/api/reviews/${providerId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Saved
  getSaved: () => request<{ saved: any[] }>('/api/saved'),
  toggleSaved: (providerId: string) => request<{ saved: boolean }>('/api/saved', { method: 'POST', body: JSON.stringify({ providerId }) }),

  // Notifications
  getNotifications: () => request<{ notifications: any[] }>('/api/notifications'),
  markAllRead: () => request<{ success: boolean }>('/api/notifications', { method: 'PATCH' }),

  // Verification
  submitVerification: (body: { cedulaUrl: string; selfieUrl: string }) =>
    request<{ request: any }>('/api/verification', { method: 'POST', body: JSON.stringify(body) }),
  getVerificationStatus: () => request<{ request: any }>('/api/verification'),

  // Admin
  getAdminStats: () => request<{ totalUsers: number; approved: number; pending: number; rejected: number; newToday: number }>('/api/admin/stats'),
  getPendingVerifications: () => request<{ requests: any[] }>('/api/admin/verifications'),
  approveVerification: (body: { requestId: string; notes?: string }) =>
    request<{ success: boolean }>('/api/admin/approve', { method: 'POST', body: JSON.stringify(body) }),
  rejectVerification: (body: { requestId: string; notes: string }) =>
    request<{ success: boolean }>('/api/admin/reject', { method: 'POST', body: JSON.stringify(body) }),
  getUsers: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return request<{ users: any[] }>(`/api/admin/users${qs}`)
  },
}
