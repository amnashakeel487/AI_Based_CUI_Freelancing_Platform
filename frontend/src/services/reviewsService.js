/**
 * Reviews service — read-only for freelancers.
 */
import { get } from './api'

/** Get rating summary: average, breakdown, recent reviews. */
export async function getReviewSummary() {
  return get('/reviews/summary')
}

/** Get full list of reviews. */
export async function getReviews() {
  return get('/reviews/')
}
