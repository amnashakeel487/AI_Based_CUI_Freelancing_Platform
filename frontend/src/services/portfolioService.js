/**
 * Freelancer portfolio service.
 */
import { get, post, put, del } from './api'
import { supabase } from '../lib/supabase'

/** Return the current freelancer's portfolio items. */
export async function getPortfolio() {
  return get('/freelancer/portfolio/')
}

/**
 * Create a new portfolio item.
 * @param {{ title, description?, technologies?, link? }} data
 */
export async function createPortfolioItem(data) {
  return post('/freelancer/portfolio/', data)
}

/**
 * Update a portfolio item.
 * @param {string} id
 * @param {object} data
 */
export async function updatePortfolioItem(id, data) {
  return put(`/freelancer/portfolio/${id}`, data)
}

/**
 * Delete a portfolio item.
 * @param {string} id
 */
export async function deletePortfolioItem(id) {
  return del(`/freelancer/portfolio/${id}`)
}

/**
 * Upload a portfolio image via Supabase Storage.
 *
 * Flow:
 * 1. Ask backend for a signed upload URL.
 * 2. PUT the file directly to Supabase Storage.
 * 3. Persist the public URL back to the portfolio item.
 *
 * Returns the public image URL.
 *
 * @param {string} itemId  portfolio item UUID
 * @param {File}   file    image file selected by the user
 */
export async function uploadPortfolioImage(itemId, file) {
  // Validate type and size client-side before uploading
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be smaller than 10 MB.')
  }

  // 1. Get signed upload URL from backend
  const { upload_url, path } = await post(
    `/freelancer/portfolio/upload-url?item_id=${itemId}`,
    {}
  )

  // 2. Upload directly to Supabase Storage
  const uploadResp = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!uploadResp.ok) throw new Error('Image upload failed.')

  // 3. Derive the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio')
    .getPublicUrl(path)

  // 4. Persist the URL on the item
  await updatePortfolioItem(itemId, { image_url: publicUrl })

  return publicUrl
}
