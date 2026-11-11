/**
 * Contracts / active-projects service.
 */
import { get, post } from './api'
import { supabase } from '../lib/supabase'

/** List the freelancer's active contracts (in_progress + submitted). */
export async function getMyContracts() {
  return get('/contracts/')
}

/** Get full workspace data: milestones, activity, submissions. */
export async function getContractDetail(projectId) {
  return get(`/contracts/${projectId}`)
}

/**
 * Submit deliverable work for client review.
 * @param {string} projectId
 * @param {{ notes: string, file_path?: string, link?: string }} data
 */
export async function submitWork(projectId, data) {
  return post(`/contracts/${projectId}/submit`, data)
}

/**
 * Raise a dispute on a project.
 * @param {string} projectId
 * @param {{ reason: string }} data
 */
export async function raiseDispute(projectId, data) {
  return post(`/contracts/${projectId}/dispute`, data)
}

/**
 * Get a signed upload URL for a deliverable file, then upload to Supabase Storage.
 * Returns the storage path to pass to submitWork().
 *
 * @param {string} projectId
 * @param {File}   file
 * @returns {Promise<string>} storage path
 */
export async function uploadDeliverable(projectId, file) {
  const ALLOWED = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]
  const MAX_BYTES = 50 * 1024 * 1024  // 50 MB

  if (!ALLOWED.includes(file.type)) {
    throw new Error('Only PDF, ZIP, JPEG, PNG, or WebP files are allowed.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File must be smaller than 50 MB.')
  }

  // 1. Get signed upload URL from backend
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const { upload_url, path } = await post(
    `/contracts/${projectId}/deliverable-upload-url?filename=${encodeURIComponent(filename)}`,
    {}
  )

  // 2. Upload directly to Supabase Storage
  const uploadResp = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!uploadResp.ok) throw new Error('File upload failed.')

  return path
}
