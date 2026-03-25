import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Faltan variables EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, whatsapp, city }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, whatsapp, city },
    },
  })
  return { data, error }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getMyProfile() {
  const session = await getSession()
  if (!session) return { data: null, error: new Error('No hay sesión activa') }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  return { data, error }
}

export async function updateProfile(updates) {
  const session = await getSession()
  if (!session) return { error: new Error('No hay sesión activa') }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', session.user.id)
    .select()
    .single()
  return { data, error }
}

// ─── Providers ───────────────────────────────────────────────────────────────

export async function getActiveProviders({ category, serviceMode, city } = {}) {
  let query = supabase
    .from('active_providers')
    .select('*')
    .order('average_rating', { ascending: false })

  if (category && category !== 'Todas') {
    query = query.eq('service_type', category)
  }
  if (serviceMode && serviceMode !== 'Todas') {
    query = query.eq('service_mode', serviceMode)
  }
  if (city) {
    query = query.eq('city', city)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getProviderById(id) {
  const { data, error } = await supabase
    .from('active_providers')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getMyProviderProfile() {
  const session = await getSession()
  if (!session) return { data: null, error: new Error('No hay sesión activa') }

  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()
  return { data, error }
}

export async function upsertProviderProfile(profile) {
  const session = await getSession()
  if (!session) return { error: new Error('No hay sesión activa') }

  const { data, error } = await supabase
    .from('provider_profiles')
    .upsert({ ...profile, user_id: session.user.id, updated_at: new Date().toISOString() })
    .select()
    .single()
  return { data, error }
}

export async function incrementProfileView(providerId) {
  await supabase.rpc('increment_profile_views', { provider_id: providerId })
}

// ─── Verification ────────────────────────────────────────────────────────────

export async function submitVerification({ cedulaUri, selfieUri }) {
  const session = await getSession()
  if (!session) return { error: new Error('No hay sesión activa') }

  const userId = session.user.id

  // Subir cédula
  const cedulaPath = `${userId}/cedula.jpg`
  const cedulaBlob = await fetch(cedulaUri).then(r => r.blob())
  const { error: cedulaError } = await supabase.storage
    .from('verifications')
    .upload(cedulaPath, cedulaBlob, { upsert: true, contentType: 'image/jpeg' })
  if (cedulaError) return { error: cedulaError }

  // Subir selfie
  const selfiePath = `${userId}/selfie.jpg`
  const selfieBlob = await fetch(selfieUri).then(r => r.blob())
  const { error: selfieError } = await supabase.storage
    .from('verifications')
    .upload(selfiePath, selfieBlob, { upsert: true, contentType: 'image/jpeg' })
  if (selfieError) return { error: selfieError }

  // Crear solicitud de verificación
  const { data, error } = await supabase
    .from('verification_requests')
    .upsert({
      user_id: userId,
      cedula_url: cedulaPath,
      selfie_url: selfiePath,
      status: 'pending',
    })
    .select()
    .single()

  // Actualizar estado del perfil a 'in_review'
  if (!error) {
    await updateProfile({ verification_status: 'in_review' })
  }

  return { data, error }
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(providerId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(full_name, avatar_url)
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createReview({ providerId, rating, comment }) {
  const session = await getSession()
  if (!session) return { error: new Error('No hay sesión activa') }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ provider_id: providerId, reviewer_id: session.user.id, rating, comment })
    .select()
    .single()
  return { data, error }
}

// ─── Saved Providers ─────────────────────────────────────────────────────────

export async function getSavedProviders() {
  const session = await getSession()
  if (!session) return { data: [], error: null }

  const { data, error } = await supabase
    .from('saved_providers')
    .select(`
      *,
      provider:provider_profiles(*, profile:profiles(full_name, avatar_url))
    `)
    .eq('user_id', session.user.id)
  return { data, error }
}

export async function toggleSaveProvider(providerId) {
  const session = await getSession()
  if (!session) return { error: new Error('No hay sesión activa') }

  const { data: existing } = await supabase
    .from('saved_providers')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('provider_id', providerId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('saved_providers')
      .delete()
      .eq('id', existing.id)
    return { saved: false, error }
  } else {
    const { error } = await supabase
      .from('saved_providers')
      .insert({ user_id: session.user.id, provider_id: providerId })
    return { saved: true, error }
  }
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications() {
  const session = await getSession()
  if (!session) return { data: [], error: null }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function markAllNotificationsRead() {
  const session = await getSession()
  if (!session) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.user.id)
    .eq('is_read', false)
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getPendingVerifications() {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(`
      *,
      user:profiles(full_name, email, whatsapp, city, role)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function approveVerification(requestId, notes = '') {
  const { error } = await supabase.rpc('approve_verification', {
    request_id: requestId,
    notes,
  })
  return { error }
}

export async function rejectVerification(requestId, notes) {
  const { error } = await supabase
    .from('verification_requests')
    .update({
      status: 'rejected',
      admin_notes: notes,
      reviewed_by: (await getSession())?.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (!error) {
    const { data } = await supabase
      .from('verification_requests')
      .select('user_id')
      .eq('id', requestId)
      .single()

    if (data) {
      await supabase.from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('id', data.user_id)

      await supabase.from('notifications').insert({
        user_id: data.user_id,
        type: 'verification_rejected',
        title: 'Verificación no aprobada',
        body: notes || 'Tu solicitud no pudo ser aprobada. Puedes intentarlo de nuevo.',
      })
    }
  }
  return { error }
}
