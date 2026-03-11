# Next.js Auth with BetterAuth + Email Verification + Zod

## Stack
- **Next.js 14** (App Router)
- **BetterAuth** — authentication (replaces NextAuth)
- **PostgreSQL** — database (BetterAuth manages its own schema)
- **Zod** — form & input validation
- **Nodemailer** — email sending
- **Tailwind CSS** — styling

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local` and fill in your values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-gmail-app-password   # NOT your real password — use App Passwords
SMTP_FROM="My App <your@gmail.com>"
```

### 3. Run database migrations
BetterAuth auto-creates its tables. Just start the dev server and it will migrate on first request.

Or run manually:
```bash
npx better-auth migrate
```

### 4. Start development server
```bash
npm run dev
```

---

## Auth Flow

1. **Register** → `/register` → BetterAuth creates user & sends verification email
2. **Verify Email** → User clicks link in email → BetterAuth marks email verified
3. **Login** → `/login` → Only works after email is verified
4. **Dashboard** → `/dashboard` → Protected server component
5. **Logout** → Calls `signOut()` from auth-client

---

## File Structure

```
app/
  api/auth/[...all]/route.ts   ← BetterAuth catch-all handler
  login/page.tsx               ← Login form (client)
  register/page.tsx            ← Register form (client)
  dashboard/
    page.tsx                   ← Protected dashboard (server)
    LogoutButton.tsx           ← Sign out button (client)
  verify-email/page.tsx        ← Email verification redirect
  page.tsx                     ← Root redirect

lib/
  auth.ts                      ← BetterAuth server config
  auth-client.ts               ← BetterAuth client hooks
  email.ts                     ← Nodemailer email sender
  validation/authSchema.ts     ← Zod schemas
```

---

## Gmail Setup (for SMTP)
1. Enable 2FA on your Google account
2. Go to: Google Account → Security → App Passwords
3. Generate a password for "Mail"
4. Use that as `SMTP_PASS`
