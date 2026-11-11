/**
 * Freelancer profile service.
 * Communicates with backend for profile management and onboarding.
 */
import { get, post, put } from './api'

/**
 * Get current freelancer's profile.
 */
export async function getProfile() {
  return get('/freelancer/profile/')
}

/**
 * Update freelancer profile fields.
 */
export async function updateProfile(data) {
  return put('/freelancer/profile/', data)
}

/**
 * Complete onboarding wizard.
 * Saves all onboarding data and marks onboarding_complete = true.
 */
export async function completeOnboarding(data) {
  return post('/freelancer/profile/onboarding/complete', data)
}

/**
 * Get profile completion percentage and missing fields.
 */
export async function getProfileCompletion() {
  return get('/freelancer/profile/completion')
}
