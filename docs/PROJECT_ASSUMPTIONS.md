# Project assumptions

This prototype intentionally separates documented requirements from implementation
choices made to produce a short, reliable demonstration.

## Directly supported by the supplied scope

- Two exercises: Target/Balloon Touch and Tracing/Path Following
- Touch or feasible stylus input
- Raw position, timestamp, event, start/end, and completion data
- Accuracy, completion time, response time, successful attempts, and path
  deviation measurements
- Correct/incorrect and on-track/off-track visual feedback
- Adjustable target and path difficulty
- Minimal animation and replayable instruction previews
- Unique participant identifiers and simple progress graphics
- Large targets, contrast, minimal text, and simple navigation

## Prototype assumptions

- Each session contains both exercises.
- The default Target Touch exercise contains six targets.
- The default path is a single cubic curve.
- Measurements use browser/SVG coordinate space, not physical millimeters.
- The research view is a read-only progress report rather than a full clinical
  dashboard.
- Supabase is used only to demonstrate connected persistence with fictional
  records.
- No authentication is included because the source explicitly excludes cloud
  patient accounts and production infrastructure.

## Unresolved with the project team

- Clinically appropriate target patterns, path geometry, difficulty ranges, and
  repetition counts
- Finger designation and whether the software needs to enforce it
- The intended formula for movement consistency
- Instructional video content and required accessibility features
- Expected tablet and stylus models
- Offline and synchronization requirements
- Research export formats
- Participant enrollment and device assignment
- Security, privacy, retention, and audit requirements for usability testing
- Whether the long-term product should be web-based or native
