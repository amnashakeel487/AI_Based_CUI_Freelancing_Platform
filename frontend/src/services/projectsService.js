/**
 * Projects service — browse, detail, save/unsave, categories.
 */
import { get, post, del } from './api'

/**
 * Fetch open projects with server-side filtering and pagination.
 * @param {object} params  Filter/sort/page params
 */
export async function getProjects(params = {}) {
  const qs = new URLSearchParams()
  if (params.q)              qs.set('q',              params.q)
  if (params.category)       qs.set('category',       params.category)
  if (params.skill)          qs.set('skill',          params.skill)
  if (params.min_budget)     qs.set('min_budget',     params.min_budget)
  if (params.deadline_before) qs.set('deadline_before', params.deadline_before)
  if (params.project_type)   qs.set('project_type',   params.project_type)
  if (params.sort)           qs.set('sort',           params.sort)
  if (params.page)           qs.set('page',           params.page)
  if (params.page_size)      qs.set('page_size',      params.page_size)
  const query = qs.toString()
  return get(`/projects/${query ? `?${query}` : ''}`)
}

/**
 * Fetch a single project by ID.
 * @param {string} id
 */
export async function getProject(id) {
  return get(`/projects/${id}`)
}

/**
 * Fetch all project categories.
 */
export async function getCategories() {
  return get('/projects/categories')
}

/**
 * Fetch AI-ranked project recommendations for the current freelancer.
 * @param {{ category?: string, sort?: string }} params
 */
export async function getRecommendations(params = {}) {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.sort)     qs.set('sort',     params.sort)
  const query = qs.toString()
  return get(`/recommendations/projects${query ? `?${query}` : ''}`)
}

/**
 * Bookmark a project.
 * @param {string} projectId
 */
export async function saveProject(projectId) {
  return post(`/projects/${projectId}/save`, {})
}

/**
 * Remove a bookmark.
 * @param {string} projectId
 */
export async function unsaveProject(projectId) {
  return del(`/projects/${projectId}/save`)
}
