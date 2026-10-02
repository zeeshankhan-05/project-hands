# Project H.A.N.D.S. Prototype

## Overview

This is an independent proof of concept built after learning about the Project
H.A.N.D.S. student developer opportunity at Carle Illinois College of Medicine.
It explores one possible technical implementation of a tablet-based participant
experience and a small research progress view.

This repository is **not** an official Carle Illinois application. It is not a
medical device, is not clinically validated, and must not be used for clinical
care. All participant records are fictional. The prototype does not provide
diagnoses, recommendations, or clinical interpretations, and it does not claim
HIPAA compliance.

- **Live prototype:** https://project-hands.vercel.app
- **Source repository:** https://github.com/zeeshankhan-05/project-hands

## Features

- Tablet-friendly participant home and guided session flow
- Target Touch exercise with adjustable target size and repetitions
- Path Tracing exercise with adjustable path width
- Touch, mouse, and supported stylus input through Pointer Events
- Raw normalized pointer coordinates, timestamps, pointer type, and available
  pressure values
- Objective metrics: attempts, successful actions, accuracy, response time,
  completion time, path deviation, and on-path percentage
- Simple correct/incorrect and on-track/off-track feedback
- Replayable interaction previews that can be disabled
- Database-backed session persistence through Supabase
- Credential-free local demo persistence for development
- Read-only participant history and longitudinal charts
- Three fictional participants and nine seeded historical sessions

## Architecture

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- **Interaction capture:** Browser Pointer Events and responsive SVG
- **Backend:** Validated Next.js Server Action
- **Database:** Supabase PostgreSQL with RLS enabled and public roles revoked
- **Deployment:** Vercel
- **Tests:** Vitest for metric calculations and submission validation

The browser batches pointer events after each exercise instead of making a
network request for every movement. Database access is isolated in the
server-only data layer at `src/lib/database.ts`. If Supabase variables are not
present, the same layer stores newly completed sessions in
`.data/sessions.json`, which is ignored by Git.

The write action is intentionally unauthenticated for this fictional-data demo.
It validates participant IDs, exercise shape, metric bounds, duration, and event
count, but it is not appropriate for a public production system or real health
data.

```text
Participant UI
    -> validated Server Action
        -> Supabase PostgreSQL (when configured)
        -> local demo file (development fallback)
    -> Research progress view
```

## Running Locally

Requirements:

- Node.js 22 or newer
- npm 10 or newer

```bash
git clone https://github.com/zeeshankhan-05/project-hands.git
cd project-hands
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No credentials are needed
for local demo mode.

Useful commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check
npm run demo:reset
```

`npm run demo:reset` removes only locally completed prototype sessions. The
built-in fictional seed history remains available.

To reset a dedicated hosted demo database, run `supabase/demo_reset.sql` in the
Supabase SQL Editor and then reseed:

```bash
npx supabase@latest seed --linked
```

The reset SQL truncates session data and must only be run against this fictional
prototype project.

## Database Setup

The SQL schema lives in `supabase/migrations/` and fictional data lives in
`supabase/seed.sql`.

### 1. Create and link a Supabase project

Create an empty project in the Supabase dashboard, then run:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref <PROJECT_REF>
```

### 2. Apply the migration

```bash
npx supabase@latest db push
```

The migration enables RLS on every public table, removes access from `anon` and
`authenticated`, and grants access only to `service_role`. The app does not send
database credentials to the browser.

### 3. Seed fictional demo data

```bash
npx supabase@latest seed --linked
```

If the project uses explicit Data API exposure, open **Project Settings → Data
API** and ensure these public tables are available to the Data API:

- `participants`
- `exercises`
- `sessions`
- `session_exercises`
- `input_events`

Postgres grants and RLS still determine access. The prototype uses a server-only
secret key that bypasses RLS; do not expose that key to a browser.

### 4. Configure local environment variables

```bash
cp .env.example .env.local
```

Set:

```text
SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

Use the current secret key from **Project Settings → API Keys**. A legacy
`service_role` key is intentionally not required by this implementation.

Restart `npm run dev` after changing environment variables. The participant home
and progress view should show “Supabase connected.”

## Demo Flow

1. Open `/patient` as `P-001 / Demo Participant`.
2. Start today’s session.
3. Complete six Target Touch repetitions.
4. Trace from the green start circle to the coral finish circle.
5. Save and review the session summary.
6. Open `/clinician`.
7. Select `P-001` and confirm that the new session appears first in history and
   in both charts.

See [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) for the recording script,
checklist, and application email draft.

## Accessibility Decisions

- Patient actions are at least 56px high; primary actions are 72px high.
- Target sizes default to 108px with an optional 84px setting.
- High-contrast text and status colors are paired with written feedback.
- Native buttons, links, form controls, tables, headings, and landmarks are used.
- Focus indicators are intentionally prominent.
- Target Touch is keyboard operable because each target is a real button.
- Motion is minimal and disabled by `prefers-reduced-motion`.
- The charts include an accessible text representation.
- The tracing interaction exposes written instructions but inherently requires
  pointer input in this prototype.

Formal accessibility and usability testing with the intended users has not been
performed.

## MVP Assumptions

- A prototype session contains both required exercises in sequence.
- An outside target tap counts as an attempt and a miss.
- Target response time runs from target appearance to a successful touch.
- Target accuracy is successful touches divided by total target attempts.
- Path deviation is the mean SVG-coordinate distance from captured points to a
  sampled reference centerline.
- On-path percentage is the percentage of captured points within the selected
  path width.
- The browser cannot verify which anatomical finger generated a touch.
- Interaction previews demonstrate software mechanics only; they are not
  clinically authored instructional videos.
- “Movement consistency” is not calculated because the source requirements do
  not define it.
- Supabase is used to demonstrate connected persistence even though the source
  document says local tablet storage is sufficient.

## Vercel Deployment

After the Supabase project is working locally:

```bash
npm install --global vercel
vercel login
vercel whoami
vercel link
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SECRET_KEY production
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_SECRET_KEY preview
vercel
```

Test the preview URL first. When it is ready:

```bash
vercel --prod
```

Alternatively, import the GitHub repository in the Vercel dashboard and add the
same two environment variables for Preview and Production. No `vercel.json` is
required because Vercel detects the Next.js project automatically.

Production verification:

1. Load `/`, `/patient`, and `/clinician`.
2. Complete and save a participant session.
3. Refresh `/clinician` and open `P-001`.
4. Confirm the new session appears.
5. Check that no browser error overlay appears.
6. Inspect deployment logs if a database request fails.

## Potential Next Steps

These follow the supplied Project H.A.N.D.S. scope rather than representing
current functionality:

- Review exercise mechanics and metric definitions with occupational therapists
- Replace interaction previews with clinically authored, captioned videos
- Evaluate native iOS, React Native, Flutter, or Unity after device requirements
  are known
- Improve offline-first tablet storage and later synchronization
- Expand stylus testing, including pressure and device-specific behavior
- Define and implement a movement-consistency measurement
- Add the proposed third rehabilitation exercise
- Conduct accessibility and usability testing with intended users
- Add authentication, authorization, audit logging, and an appropriate security
  architecture before handling real participant data
- Add research-specific exports after the required format is defined
- Evaluate HIPAA requirements before any clinical deployment; this prototype is
  not HIPAA compliant

## Source Scope

The implementation is based on the two-page “Project H.A.N.D.S. – MVP Technical
Scope” document supplied with the student developer opportunity. The document
explicitly places AI/ML, computer vision, EHR integration, a full clinician
dashboard, cloud patient accounts, production HIPAA infrastructure, AR/VR,
robotics, and external hardware outside the December MVP.
