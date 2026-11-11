/**
 * Bids (proposals) service.
 */
import { get, post, put } from './api'

/**
 * Submit a new proposal.
 * @param {{ project_id, cover_letter, amount, delivery_days, portfolio_item_id? }} data
 */
export async function createBid(data) {
  return post('/bids/', data)
}

/**
 * List all my proposals, optionally filtered by status.
 * @param {string} [bidStatus]  pending | accepted | rejected | withdrawn
 */
export async function getMyBids(bidStatus) {
  const qs = bidStatus ? `?status=${encodeURIComponent(bidStatus)}` : ''
  return get(`/bids/${qs}`)
}

/**
 * Get a single proposal by ID.
 * @param {string} id
 */
export async function getBid(id) {
  return get(`/bids/${id}`)
}

/**
 * Edit a pending proposal.
 * @param {string} id
 * @param {object} data
 */
export async function updateBid(id, data) {
  return put(`/bids/${id}`, data)
}

/**
 * Withdraw a pending proposal.
 * @param {string} id
 */
export async function withdrawBid(id) {
  return post(`/bids/${id}/withdraw`, {})
}
