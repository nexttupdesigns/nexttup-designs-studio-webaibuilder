# Next Up Design Studio

A React + Vite website-builder prototype. Generation currently uses local templates and keyword-based edits; it does not call an AI provider. The interface labels this mode explicitly.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and anon key.
4. Apply the SQL migrations in `supabase/migrations/`.
5. In Supabase, enable Email authentication and configure the allowed site/redirect URLs for this app.
6. Run `npm run dev`.

The anon key is intended for browser use; the database migration's row-level security policies are what prevent access to another user's projects. Never put a Supabase service-role key in this frontend.

## Authentication and project privacy

Users can create an account or sign in with email and password. The private-projects migration adds `owner_id` and replaces the anonymous CRUD policies with authenticated owner-only policies. Existing project rows are left intact with a null owner and become inaccessible through the app; they are not assigned to a new account automatically.

The Supabase project must have the migrations applied and Email authentication configured before sign-in and saved projects will work. This repository does not include or verify a live Supabase deployment.

## Current limitations

- Website generation and edits are local deterministic templates, not AI.
- The generated output is one HTML file (`index.html`); the Files tab reports that actual file.
- Contact forms in generated previews are illustrative and do not send messages.
- No provider API key is expected in the browser. A real AI provider should be added behind a server-side endpoint and configured with a server secret.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`
