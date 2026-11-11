# CUI Freelance frontend design: drop-in guide

Verified: `npm run build` passes (Vite 5, React 18, Tailwind 3, React Router 6, lucide-react).

## Add to your existing Kiro project (do not replace it)
1. Back up / commit your project first (`git commit`).
2. Install anything missing: `npm i react-router-dom lucide-react` and Tailwind 3 dev deps if absent.
3. Merge `tailwind.config.js` colors/fonts/animations into yours. Add the Plus Jakarta Sans `<link>` from `index.html` to yours. Merge `src/index.css`.
4. Copy these into `frontend/src/`: `components/`, `layouts/`, `context/`, `data/`, `utils/`, `pages/`, `routes/AppRouter.jsx`.
5. Where a file already exists (Login.jsx, Sidebar.jsx, AppRouter.jsx, Dashboard.jsx...), compare first and keep whichever is better. Update `main.jsx` to wrap the app in `RoleProvider` and `ToastProvider` (see this `main.jsx`).
6. Run `npm run dev`.

## Route map
Public: `/`
Auth: `/role` `/register/freelancer` `/register/client` `/verify-email` `/login` `/forgot-password` `/reset-password`
Onboarding: `/onboarding/freelancer` `/onboarding/client`
Freelancer (`/freelancer/...`): dashboard, profile, profile/edit, skills, portfolio, projects, projects/:id, projects/:id/apply, recommendations, proposals, proposals/:id, active, active/:id, active/:id/submit, messages, notifications, reviews, earnings, transactions, settings, help
Client: `/client/dashboard` (entry point only)

## Where to plug in the backend (search for `TODO(`)
- `data/mock.js` is the only data source: replace imports with Supabase/FastAPI service functions.
- `RoleContext.jsx`, `Login.jsx`, `Register.jsx`, `EmailVerification.jsx`, `PasswordRecovery.jsx`: Supabase Auth.
- `AppRouter.jsx`: add a `RequireAuth` guard; role must come from the user's profile, never from the browser.
- `utils/validate.js`: set `REQUIRE_COMSATS_EMAIL = true` if COMSATS-only is policy.
- Uploads (photo, deliverables, attachments) are disabled and labelled until storage exists.
