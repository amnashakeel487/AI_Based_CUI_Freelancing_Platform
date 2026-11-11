/**
 * Complaints service.
 */
import { get, post } from './api'

/** List all complaints filed by the current freelancer. */
export async function getMyComplaints() {
  return get('/complaints/')
}

/** File a new complaint. */
export async function createComplaint(data) {
  return post('/complaints/', data)
}
