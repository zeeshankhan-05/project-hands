# Demo and application guide

## 2–4 minute video script

### 0:00–0:20 — Introduction

“Hi, I’m Zeeshan. I recently learned about the Project H.A.N.D.S. CS developer
opportunity, and the combination of tablet interaction, movement data, and
progress tracking sounded really interesting. I built a small proof of concept
based on the technical scope you shared.”

Show the landing page briefly.

“This is only an independent technical prototype. It isn’t clinically validated,
and every participant record is fictional.”

### 0:20–1:30 — Participant experience

Open `/patient` at a tablet-sized viewport.

“The participant home is intentionally simple: large controls, minimal text, the
two activities in today’s session, and a short previous-session summary.”

Select **Start session**.

“The prototype supports adjustable target size, repetition count, and tracing
path width. The interaction preview can also be turned off.”

Start the session and complete Target Touch.

“For each target it records normalized touch position, timestamp, pointer type,
hit or miss, and response time.”

Complete Path Tracing.

“Tracing captures the movement trajectory and gives simple on-track or off-track
feedback. It calculates mean path deviation and the percentage of captured
points that stayed within the path.”

Save the result and show the completion summary.

### 1:30–2:30 — Research progress view

Select **View progress data**, or switch to a prepared `/clinician` tab.

“The result is persisted and appears in this lightweight research progress view.
The source document places a full clinician dashboard outside the initial MVP,
so I kept this focused on objective activity measurements.”

Open `P-001`.

“Here is the newly completed session, the previous fictional session history,
and simple charts for target accuracy and completion time. The interface reports
measurements only—it doesn’t make clinical conclusions.”

### 2:30–3:00 — Technical overview

“The application uses Next.js, React, and TypeScript. Pointer Events support
touch, mouse, and compatible styluses. A validated server action stores the
session in Supabase Postgres, and the dashboard reads the same data back. Raw
movement events and session-level metrics are stored separately.”

### 3:00–end — Closing

“This is only a quick prototype based on my current understanding of the project.
I’d be interested in learning the team’s actual clinical and usability
requirements, and I’d be excited to help build and test the real platform.
Thanks for taking a look.”

## Recording checklist

- Production URL opens in a private/incognito window
- Complete one production test session before recording
- Reset demo data if the history has become cluttered
- Close notifications, email, messages, and unrelated tabs
- Set the participant tab to a 1024×768 viewport
- Prepare a second tab at `/clinician`
- Keep `P-001` participant detail one click away
- Confirm the microphone input and recording level
- Hide bookmarks and personal browser extensions if visible
- Use a neutral desktop background
- Target 2:45–3:30; stay below four minutes
- Record at 1080p when available

Exact pages:

1. `/`
2. `/patient`
3. `/patient/session`
4. `/patient/complete?session=<generated-id>`
5. `/clinician`
6. `/clinician/participants/10000000-0000-4000-8000-000000000001`

### Easiest macOS recording method

1. Open the browser and prepare both tabs.
2. Press **Shift–Command–5**.
3. Choose **Record Selected Portion** and frame the browser content.
4. Open **Options**, choose the intended microphone, and disable the timer unless
   desired.
5. Start recording and wait one second before speaking.
6. Stop from the menu-bar control.
7. Trim the beginning and end in QuickTime Player.

QuickTime Player’s **File → New Screen Recording** opens the same macOS capture
controls. The built-in recorder is sufficient; OBS is only worth using if a
camera overlay or more audio control is needed.

## Short application email

**Subject:** Project H.A.N.D.S. CS developer — proof of concept

Hi Project H.A.N.D.S. Team,

Thanks for sending over the additional information. I read through the MVP scope
and thought the combination of tablet interaction, movement-data capture, and
progress tracking sounded really interesting.

I spent some time building a small proof of concept with the two exercises from
the document: Target Touch and Path Tracing. It includes a tablet-style
participant flow, database-backed session tracking, and a lightweight progress
view for reviewing objective measurements over time.

Short demo: [VIDEO]

Live prototype: [LIVE APP]

GitHub: [REPOSITORY]

This is just an independent prototype based on my current understanding—not an
official or clinically validated application—but I thought it would be a useful
way to show how I could contribute technically. I’d be excited to learn more
about the team’s actual requirements and help develop the real MVP.

Best,

Zeeshan
