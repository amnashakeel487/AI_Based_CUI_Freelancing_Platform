# Traceability Matrix — SRS Requirements → Implementation

This matrix maps each SRS functional requirement (FR) and use case (UC) to the
specific screens, API endpoints, database tables, and tests that implement it.

---

## Authentication & Registration

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-1.1 | User registration with email/password | Register.jsx | POST /auth/validate-registration, Supabase signUp | profiles | test_auth.py (4 tests) |
| FR-1.2 | COMSATS email domain restriction | Register.jsx (client-side hint) | POST /auth/validate-registration | — | test_email_validation_* (3 tests) |
| FR-1.3 | Pending approval state | PendingApproval.jsx, RequireAuth.jsx | GET /auth/me (approval_status field) | freelancer_profiles.approval_status | test_me_endpoint_* (2 tests) |
| FR-1.4 | Email verification (OTP) | EmailVerification.jsx | Supabase verifyOtp + POST /auth/register-complete | profiles, freelancer_profiles | test_jwt_token_creation |
| FR-1.5 | Password recovery | PasswordRecovery.jsx | Supabase resetPasswordForEmail + updateUser | auth.users | — |
| UC-1.1 | Freelancer registers account | RoleSelection → Register → EmailVerification → Onboarding | POST /auth/validate-registration, register-complete | profiles, freelancer_profiles | test_auth.py |
| UC-1.2 | Freelancer pending until approved | PendingApproval.jsx, RequireAuth (requireApproval) | GET /auth/me | freelancer_profiles.approval_status | test_me_endpoint_without_auth |

---

## Profile Management

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-3.2 | Freelancer profile (personal, academic, links) | Profile.jsx, EditProfile.jsx | GET/PUT /freelancer/profile/ | profiles, freelancer_profiles | — |
| FR-3.3 | Profile completion tracking | Dashboard.jsx (completion %) | GET /freelancer/profile/completion | freelancer_profiles.profile_completion | — |
| FR-3.5 | Portfolio items | Portfolio.jsx | GET/POST/PUT/DELETE /freelancer/portfolio/ | portfolio_items | test_portfolio.py (10 tests) |
| FR-3.8 | Skills management with levels | Skills.jsx, SkillPicker.jsx | GET/POST/PUT/DELETE /freelancer/skills/ | skills, freelancer_skills | test_skills.py (10 tests) |

---

## Projects & Bidding

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-3.2 | Browse open projects | BrowseProjects (Projects.jsx) | GET /projects/ (filter/sort/paginate) | projects, project_skills | — |
| FR-3.3 | Project details | ProjectDetails (Projects.jsx) | GET /projects/{id} | projects | — |
| FR-4.5 | Save/bookmark projects | ProjectCard save button | POST/DELETE /projects/{id}/save | saved_projects | — |
| UC-3.2 | Approved freelancer bids on open project | SubmitProposal (Proposals.jsx) | POST /bids/ (approved-only, open-only, one-per-project) | bids | test_bids.py (12 tests) |
| — | View my proposals | MyProposals (Proposals.jsx) | GET /bids/ | bids | — |
| — | Edit pending proposal | SubmitProposal (edit mode) | PUT /bids/{id} (pending only) | bids | test_bid_update_* |
| — | Withdraw proposal | MyProposals withdraw | POST /bids/{id}/withdraw (pending only) | bids | — |

---

## Recommendations (BO-4)

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | Service | Test |
|--------|-------------|----------------|-----------------|---------|------|
| BO-4 | AI-assisted project matching | Recommendations (Projects.jsx) | GET /recommendations/projects | services/recommendation.py (score_project, rank_projects) | test_recommendations.py (12 tests) |
| — | Transparent scoring (rule-based) | Recommendations page label "Rule-based" | engine="rule-based" field | LEVEL_WEIGHTS (3/2/1) + category bonus | test_perfect_match, test_partial_match, test_category_bonus |

---

## Active Projects & Submissions

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-3.5 | Submit work (file or link) | SubmitWork (Work.jsx) | POST /contracts/{id}/submit | submissions | test_contracts.py (6 schema tests) |
| FR-2.3 | Activity/communication log | Workspace activity tab (Work.jsx) | GET /contracts/{id} (activity field) | activity_log | — |
| — | Milestones tracking | Workspace milestones tab | GET /contracts/{id} (milestones field) | milestones | — |
| — | Deliverable upload (Supabase Storage) | SubmitWork file upload | POST /contracts/{id}/deliverable-upload-url | storage.deliverables | — |
| — | Raise dispute | Workspace dispute modal (Work.jsx) | POST /contracts/{id}/dispute | disputes | test_dispute_* (2 tests) |

---

## Messaging (FE-2)

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-2.1 | Freelancer messages client | Messages.jsx | GET /messages/conversations, POST .../messages | conversations, messages | test_messages.py (6 tests) |
| FR-2.3 | Messages visible only to participants | — (RLS enforced) | — (participant verification in router) | conversations, messages (RLS) | test_*_requires_auth (4 tests) |
| FE-2 | Real-time messaging | Messages.jsx (Supabase Realtime) | — (Realtime subscription) | messages (Realtime) | — |

---

## Notifications (FR-2.2)

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-2.2 | Notifications for bid response, payment, submission, dispute | Notifications.jsx | GET /notifications/, POST .../read, POST /read-all | notifications | test_notifications.py (3 tests) |
| — | Real-time notifications | Notifications.jsx (Supabase Realtime) | — (Realtime subscription) | notifications (Realtime) | — |

---

## Reviews (FR-3.5)

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-3.5 | Ratings shown on profile | Reviews.jsx | GET /reviews/summary, GET /reviews/ | reviews | — |
| — | Rating breakdown (1–5 stars) | Reviews.jsx breakdown bars | GET /reviews/summary (breakdown field) | reviews.rating | — |

---

## Earnings & Transactions (FR-5.4)

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-5.4 | Read-only earnings view | Earnings (Money.jsx) | GET /earnings/summary | transactions (payee_id) | — |
| — | Transaction history | Transactions (Money.jsx) | GET /earnings/transactions, GET .../transactions/{id} | transactions | test_reviews_earnings.py (3 tests) |

---

## Complaints & Disputes

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| — | Submit complaint | Help.jsx | POST /complaints/ | complaints | test_complaint_create_* (3 tests) |
| — | View own complaints | Help.jsx | GET /complaints/ | complaints | test_list_complaints_requires_auth |
| — | Raise dispute on project | Work.jsx dispute modal | POST /contracts/{id}/dispute | disputes | test_dispute_* (2 tests) |

---

## Account Settings

| SRS ID | Requirement | Frontend Screen | Backend Endpoint | DB Table | Test |
|--------|-------------|----------------|-----------------|----------|------|
| FR-6.3 | Account settings | Settings.jsx | PUT /account/settings | freelancer_profiles | test_update_settings_requires_auth |
| — | Password change | Settings.jsx security tab | Supabase auth.updateUser | auth.users | — |
| FR-6.4 | Premium AI tools (placeholder) | Settings.jsx "AI Tools" tab | — (is_premium flag in DB) | freelancer_profiles.is_premium | — |

---

## Status Vocabulary (UI-5)

| SRS ID | Status Type | Values | Where Enforced |
|--------|-------------|--------|----------------|
| UI-5 | Project status | open, in_progress, submitted, completed, cancelled | DB CHECK constraint, StatusBadge component |
| UI-5 | Bid/proposal status | pending, accepted, rejected, withdrawn | DB CHECK constraint, StatusBadge component |
| UI-5 | Payment status | held_in_escrow, released, refunded | DB CHECK constraint, StatusBadge component |
| — | Approval status | pending, approved, rejected | DB CHECK constraint, PendingApproval.jsx |

---

## Naming Convention

| Term | UI Text | API/DB Name | Rationale |
|------|---------|-------------|-----------|
| Proposal/Bid | "proposal" | `bids` | SRS uses "bid"; UI already says "proposal"; one term in code |

---

## Intentionally Excluded (Future Phases)

| Feature | SRS ID | Status |
|---------|--------|--------|
| Client module (post projects, hire, release payment, rate) | — | Not built |
| Admin module (approve accounts, resolve disputes, view all) | UC-1.2, FR-4.1 | DB + RLS ready, no admin UI |
| Escrow deposit/release/refund | FR-5.x | Transactions table exists, read-only for freelancers |
| Stripe/JazzCash/bank transfer | — | Payment phase |
| AI chatbot | — | Future |
| Premium AI tools | FR-6.4 | Placeholder only (disabled "Coming soon" card) |
| Email notifications beyond auth | FR-2.2 | Supabase auth emails only |
