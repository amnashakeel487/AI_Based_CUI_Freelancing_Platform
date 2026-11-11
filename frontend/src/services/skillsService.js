/**
 * Freelancer skills service.
 */
import { get, post, put, del } from './api'

/** Return the current freelancer's skills. */
export async function getMySkills() {
  return get('/freelancer/skills/')
}

/**
 * Search the master skills catalog.
 * @param {string} q  substring to search
 */
export async function getSkillsCatalog(q = '') {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return get(`/freelancer/skills/catalog${qs}`)
}

/**
 * Replace the freelancer's entire skill list.
 * @param {{ name: string, level: string }[]} skills
 */
export async function replaceSkills(skills) {
  return put('/freelancer/skills/', { skills })
}

/**
 * Add a single skill.
 * @param {{ name: string, level: string }} skill
 */
export async function addSkill(skill) {
  return post('/freelancer/skills/', skill)
}

/**
 * Remove a skill by its catalog ID.
 * @param {string} skillId
 */
export async function deleteSkill(skillId) {
  return del(`/freelancer/skills/${skillId}`)
}
