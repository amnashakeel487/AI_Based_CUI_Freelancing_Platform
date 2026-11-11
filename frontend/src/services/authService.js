/**
 * Authentication service for Supabase Auth and backend integration.
 */
import { supabase } from '../lib/supabase'
import { get, post } from './api'

/**
 * Validate email domain before registration.
 * Calls backend to check if email is from allowed domain.
 */
export async function validateEmail(email) {
  try {
    const response = await post('/auth/validate-registration', { email })
    return response
  } catch (error) {
    console.error('Email validation error:', error)
    throw error
  }
}

/**
 * Sign up a new user.
 * Validates email domain, then creates Supabase Auth account.
 * Profile rows are created via completeRegistration() after email verification.
 */
export async function signUp({ email, password, full_name, phone, role }) {
  // First validate the email domain against backend config
  const validation = await validateEmail(email)
  if (!validation.valid) {
    throw new Error(validation.message)
  }

  // Sign up with Supabase Auth – stores metadata for use after verification
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone, role },
    },
  })

  if (error) throw error
  return data
}

/**
 * Create the profiles / freelancer_profiles rows in the database.
 *
 * Called ONCE, immediately after the user has a live session (after OTP verify
 * or after clicking the magic link).  Safe to call again — the backend endpoint
 * is idempotent.
 *
 * @param {{ role: string, full_name: string, phone?: string }} meta
 */
export async function completeRegistration({ role, full_name, phone }) {
  return post('/auth/register-complete', { role, full_name, phone: phone || null })
}

/**
 * Sign in with email and password.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current user profile from backend (/auth/me).
 * Returns role, approval_status, onboarding_complete, etc.
 */
export async function getCurrentUser() {
  const profile = await get('/auth/me')
  return profile
}

/**
 * Verify email with a 6-digit OTP code sent by Supabase.
 * After success, a session is active and completeRegistration() must be called.
 */
export async function verifyEmail(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })

  if (error) throw error
  return data
}

/**
 * Send password reset email.
 */
export async function resetPasswordRequest(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return data
}

/**
 * Update password (within an active recovery session).
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

/**
 * Get the current Supabase session.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Refresh the current session token.
 */
export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return session
}
