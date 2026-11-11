export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
// Policy switch: set to true to require a COMSATS address (e.g. @cuilahore.edu.pk, @comsats.edu.pk).
export const REQUIRE_COMSATS_EMAIL = false
export const isComsats = (v) => /@([a-z0-9-]+\.)*(comsats|cui[a-z]*)\.edu\.pk$/i.test(v)
export const isPhone = (v) => /^[+\d][\d\s-]{8,16}$/.test(v)
export function passwordIssues(p) {
  if (p.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Include at least one letter and one number.'
  return ''
}
export function validateAccount(v, { client } = {}) {
  const e = {}
  if (!v.name.trim()) e.name = 'Enter your full name.'
  if (!isEmail(v.email)) e.email = 'Enter a valid email address.'
  else if (REQUIRE_COMSATS_EMAIL && !isComsats(v.email)) e.email = 'Use your COMSATS email address.'
  if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number.'
  if (client && v.clientType === 'Organization' && !v.org.trim()) e.org = 'Enter the organization name.'
  const pw = passwordIssues(v.password); if (pw) e.password = pw
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match.'
  if (!v.terms) e.terms = 'You must accept the terms and privacy policy.'
  return e
}
