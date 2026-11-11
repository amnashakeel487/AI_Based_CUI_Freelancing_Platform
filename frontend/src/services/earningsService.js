/**
 * Earnings and transactions service — read-only for freelancers.
 */
import { get } from './api'

/** Get earnings summary: total, released, held, refunded, recent transactions. */
export async function getEarningsSummary() {
  return get('/earnings/summary')
}

/** List all transactions where the freelancer is payee. */
export async function getTransactions() {
  return get('/earnings/transactions')
}

/** Get a single transaction by ID. */
export async function getTransaction(id) {
  return get(`/earnings/transactions/${id}`)
}
