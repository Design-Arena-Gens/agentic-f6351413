# Gmail Sender Agent

Agentic Next.js workspace for composing polished outreach, generating tone-aware drafts, and dispatching messages through the Gmail API with OAuth2.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and populate with Gmail OAuth2 credentials:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
   - `GMAIL_FROM_ADDRESS` (must match the refresh token account)
   - Optional: `GMAIL_FROM_NAME`, `NEXT_PUBLIC_SENDER_NAME`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`.

## Gmail OAuth Notes

- Generate the refresh token with the scope `https://mail.google.com/` or `https://www.googleapis.com/auth/gmail.send`.
- The refresh token must be authorized for the Gmail account defined by `GMAIL_FROM_ADDRESS`.
- Vercel deployment: add the same environment variables in the project settings before deploying.

## Development Scripts

- `npm run dev` – start the Next.js dev server.
- `npm run build` – production build.
- `npm start` – run the production server locally.
- `npm run lint` – lint the codebase.

## Architecture

- App Router (`app/`) with a single-page composer UI.
- API route `app/api/send-email/route.ts` validates payloads and sends messages via Gmail using `googleapis`.
- UI features live preview, tone presets, and draft generator placeholders.

## Deployment

Build and test locally, then deploy using:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-f6351413
```
After deployment completes, validate:
```bash
curl https://agentic-f6351413.vercel.app
```
