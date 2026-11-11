# Row Level Security (RLS) Test Checklist

Use this checklist to verify that RLS policies are working correctly.

## Test Setup

Create test users in each role:
- **User A**: Approved freelancer
- **User B**: Pending freelancer  
- **User C**: Client
- **User D**: Admin
- **User E**: Unauthenticated (no token)

## How to Test

Use Supabase SQL Editor with different user contexts:

```sql
-- Set user context (use actual user UUID)
SET request.jwt.claim.sub = 'user-uuid-here';

-- Then run SELECT queries to test read access
SELECT * FROM profiles;
```

Or use the Supabase JS client with different auth tokens.

---

## ✅ Profiles Table

### As Unauthenticated User (E)
- [ ] ❌ Cannot SELECT any profiles
- [ ] ❌ Cannot INSERT profiles
- [ ] ❌ Cannot UPDATE any profiles

### As Freelancer (A - approved)
- [ ] ✅ Can SELECT own profile
- [ ] ✅ Can UPDATE own profile (except role field)
- [ ] ✅ Can SELECT other approved freelancers' profiles
- [ ] ❌ Cannot UPDATE other users' profiles
- [ ] ❌ Cannot change own role

### As Client (C)
- [ ] ✅ Can SELECT own profile
- [ ] ✅ Can UPDATE own profile
- [ ] ✅ Can SELECT approved freelancer profiles

---

## ✅ Freelancer Profiles Table

### As Pending Freelancer (B)
- [ ] ✅ Can SELECT own freelancer_profile
- [ ] ✅ Can UPDATE own profile (except approval_status)
- [ ] ❌ Cannot UPDATE approval_status or rejection_reason
- [ ] ❌ Cannot SELECT other freelancers' profiles

### As Approved Freelancer (A)
- [ ] ✅ Can SELECT own freelancer_profile
- [ ] ✅ Can UPDATE own profile fields
- [ ] ✅ Can SELECT other approved freelancers' profiles (for matching)
- [ ] ❌ Cannot UPDATE approval_status

### As Client (C)
- [ ] ✅ Can SELECT approved freelancers' profiles
- [ ] ❌ Cannot SELECT pending freelancers' profiles
- [ ] ❌ Cannot UPDATE any freelancer profiles

### As Admin (D)
- [ ] ✅ Can SELECT all freelancer profiles
- [ ] ✅ Can UPDATE approval_status and rejection_reason
- [ ] ✅ Can approve/reject pending freelancers

---

## ✅ Skills & Freelancer Skills

### As Any Authenticated User
- [ ] ✅ Can SELECT from skills table (catalog)

### As Freelancer (A)
- [ ] ✅ Can INSERT into freelancer_skills (own skills)
- [ ] ✅ Can UPDATE own freelancer_skills
- [ ] ✅ Can DELETE own freelancer_skills
- [ ] ❌ Cannot modify other users' skills

### As Client (C)
- [ ] ✅ Can SELECT approved freelancers' skills
- [ ] ❌ Cannot INSERT/UPDATE/DELETE skills

---

## ✅ Portfolio Items

### As Freelancer (A)
- [ ] ✅ Can INSERT own portfolio items
- [ ] ✅ Can UPDATE own portfolio items
- [ ] ✅ Can DELETE own portfolio items
- [ ] ❌ Cannot modify other users' portfolios

### As Client (C)
- [ ] ✅ Can SELECT approved freelancers' portfolios
- [ ] ❌ Cannot modify any portfolios

### As Pending Freelancer (B)
- [ ] ✅ Can manage own portfolio
- [ ] ❌ Portfolio not visible to others (not approved)

---

## ✅ Projects Table

### As Client (C)
- [ ] ✅ Can INSERT projects (create new)
- [ ] ✅ Can UPDATE own projects
- [ ] ✅ Can DELETE own projects
- [ ] ✅ Can SELECT own projects
- [ ] ❌ Cannot SELECT other clients' projects
- [ ] ❌ Cannot UPDATE other clients' projects

### As Approved Freelancer (A)
- [ ] ✅ Can SELECT open projects
- [ ] ✅ Can SELECT projects they've bid on
- [ ] ❌ Cannot SELECT random in_progress projects (not theirs)
- [ ] ❌ Cannot UPDATE any projects
- [ ] ❌ Cannot INSERT projects

### As Pending Freelancer (B)
- [ ] ❌ Cannot SELECT any projects (not approved)

### As Admin (D)
- [ ] ✅ Can SELECT all projects

---

## ✅ Bids Table

### As Approved Freelancer (A)
- [ ] ✅ Can INSERT bid on open project (first time)
- [ ] ❌ Cannot INSERT second bid on same project (UNIQUE constraint)
- [ ] ✅ Can UPDATE own pending bid
- [ ] ❌ Cannot UPDATE accepted/rejected bid
- [ ] ✅ Can SELECT own bids
- [ ] ❌ Cannot SELECT other freelancers' bids

### As Pending Freelancer (B)
- [ ] ❌ Cannot INSERT bids (not approved)

### As Client (C)
- [ ] ✅ Can SELECT bids on own projects
- [ ] ✅ Can UPDATE bid status (accept/reject)
- [ ] ✅ Can UPDATE client_response field
- [ ] ❌ Cannot SELECT bids on other projects
- [ ] ❌ Cannot INSERT bids (clients don't bid)

### As Admin (D)
- [ ] ✅ Can SELECT all bids

---

## ✅ Conversations & Messages

### As Freelancer (A) in conversation with Client (C)
- [ ] ✅ Can SELECT conversations where they're a participant
- [ ] ✅ Can INSERT messages in their conversations
- [ ] ✅ Can SELECT messages in their conversations
- [ ] ✅ Can UPDATE read_at on messages
- [ ] ❌ Cannot SELECT conversations they're not in
- [ ] ❌ Cannot INSERT messages in others' conversations

### As Client (C)
- [ ] ✅ Can INSERT conversation with freelancer
- [ ] ✅ Can send messages in own conversations
- [ ] ✅ Can read messages in own conversations
- [ ] ❌ Cannot read other conversations

### As Admin (D)
- [ ] ✅ Can SELECT all conversations (for disputes)
- [ ] ✅ Can SELECT all messages

---

## ✅ Notifications

### As Freelancer (A)
- [ ] ✅ Can SELECT own notifications
- [ ] ✅ Can UPDATE own notifications (mark as read)
- [ ] ❌ Cannot SELECT other users' notifications
- [ ] ❌ Cannot INSERT notifications (service role only)

### As Service Role (Backend)
- [ ] ✅ Can INSERT notifications for any user

---

## ✅ Reviews

### As Freelancer (A)
- [ ] ✅ Can SELECT own reviews
- [ ] ❌ Cannot INSERT reviews (freelancers receive them)
- [ ] ❌ Cannot UPDATE/DELETE reviews

### As Client (C)
- [ ] ✅ Can INSERT review for completed project
- [ ] ❌ Cannot INSERT duplicate review for same project
- [ ] ✅ Can SELECT reviews for freelancers

### Anyone Authenticated
- [ ] ✅ Can SELECT reviews of approved freelancers (public)

---

## ✅ Transactions

### As Freelancer (A)
- [ ] ✅ Can SELECT transactions where they're payee
- [ ] ❌ Cannot SELECT transactions they're not involved in
- [ ] ❌ Cannot INSERT/UPDATE transactions (service role only)

### As Client (C)
- [ ] ✅ Can SELECT transactions where they're payer
- [ ] ❌ Cannot SELECT others' transactions

### As Service Role (Backend)
- [ ] ✅ Can INSERT/UPDATE transactions

---

## ✅ Disputes & Complaints

### As Freelancer (A) on accepted project
- [ ] ✅ Can INSERT dispute on their project
- [ ] ✅ Can SELECT disputes they raised
- [ ] ✅ Can SELECT disputes on projects they're in
- [ ] ❌ Cannot UPDATE dispute status (admin only)

### As Client (C)
- [ ] ✅ Can INSERT dispute on their project
- [ ] ✅ Can SELECT disputes they raised or are in

### As Admin (D)
- [ ] ✅ Can SELECT all disputes
- [ ] ✅ Can UPDATE dispute status
- [ ] ✅ Can UPDATE resolution field

### Complaints
- [ ] ✅ Any user can INSERT complaint
- [ ] ✅ Users can SELECT own complaints
- [ ] ✅ Admin can SELECT all complaints
- [ ] ✅ Admin can UPDATE complaint status

---

## ✅ Storage: Avatars Bucket

### As Freelancer (A)
- [ ] ✅ Can upload to avatars/{own_user_id}/
- [ ] ✅ Can update own avatar
- [ ] ✅ Can delete own avatar
- [ ] ❌ Cannot upload to avatars/{other_user_id}/

### Public Access
- [ ] ✅ Anyone can view avatars (public bucket)

---

## ✅ Storage: Portfolio Bucket

### As Freelancer (A)
- [ ] ✅ Can upload to portfolio/{own_user_id}/
- [ ] ✅ Can update own portfolio images
- [ ] ✅ Can delete own portfolio images
- [ ] ❌ Cannot upload to portfolio/{other_user_id}/

### Public Access
- [ ] ✅ Anyone can view portfolio images (public bucket)

---

## ✅ Storage: Deliverables Bucket

### As Freelancer (A) with accepted bid on Project X
- [ ] ✅ Can upload to deliverables/{own_user_id}/
- [ ] ✅ Can view own deliverables
- [ ] ❌ Cannot view other freelancers' deliverables

### As Client (C) on Project X
- [ ] ✅ Can view deliverables from freelancer working on Project X
- [ ] ❌ Cannot view deliverables from other projects

### Public Access
- [ ] ❌ No public access (private bucket)

---

## Test Commands

### Test as specific user (SQL Editor)
```sql
-- Replace with actual user UUID
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
SET LOCAL role = 'authenticated';

-- Now run queries
SELECT * FROM profiles WHERE id = current_setting('request.jwt.claim.sub')::uuid;
```

### Test with Supabase JS Client
```javascript
// Create client with user's token
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${userToken}` } }
});

// Try operations
const { data, error } = await supabase.from('profiles').select('*');
console.log('Result:', data, error);
```

### Quick Test Script
```bash
# In supabase/migrations folder
# Create test_rls.sql with your test queries
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f test_rls.sql
```

---

## Expected Failures (Good!)

These should FAIL (deny access):
- ❌ Pending freelancer browsing projects
- ❌ Pending freelancer creating bids
- ❌ Freelancer updating other freelancers' portfolios
- ❌ Client reading other clients' projects
- ❌ User reading other users' notifications
- ❌ Freelancer creating transactions
- ❌ User uploading to other users' storage folders

---

## If Tests Fail

1. **Check policy exists**: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
2. **Check RLS enabled**: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
3. **Check user context**: `SELECT auth.uid(), current_user_role();`
4. **Review policy logic**: Policies might be too restrictive or too permissive
5. **Check Supabase logs**: Dashboard → Logs → Postgres Logs

---

## Sign-off

Once all tests pass:
- [ ] All RLS policies tested and working
- [ ] Storage policies tested and working
- [ ] No unauthorized data access possible
- [ ] Ready for backend integration

Tested by: ________________  
Date: ________________
