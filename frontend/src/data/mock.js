// Utility formatters — the only exports remaining from the former demo data file.
// All mock data has been replaced by real API calls across all pages.
// Keep these two functions here since many components import them.

export const formatPKR = (n) => `PKR ${Number(n).toLocaleString('en-PK')}`
export const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
