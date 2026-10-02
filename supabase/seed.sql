insert into public.participants (id, participant_code, display_name, created_at)
values
  ('10000000-0000-4000-8000-000000000001', 'P-001', 'Demo Participant', '2026-09-01T14:00:00Z'),
  ('10000000-0000-4000-8000-000000000002', 'P-002', 'Sample Participant 2', '2026-09-01T14:00:00Z'),
  ('10000000-0000-4000-8000-000000000003', 'P-003', 'Sample Participant 3', '2026-09-01T14:00:00Z')
on conflict (id) do update set
  participant_code = excluded.participant_code,
  display_name = excluded.display_name;

insert into public.exercises (id, slug, name, description)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'target-touch',
    'Target Touch',
    'Touch each on-screen target as it appears.'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'path-tracing',
    'Path Tracing',
    'Follow the path from its start to its finish.'
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.sessions (
  id, participant_id, started_at, completed_at, status, total_duration_ms
)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', now() - interval '9 days', now() - interval '9 days' + interval '112 seconds', 'completed', 112000),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', now() - interval '6 days', now() - interval '6 days' + interval '103 seconds', 'completed', 103000),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', now() - interval '3 days', now() - interval '3 days' + interval '95 seconds', 'completed', 95000),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', now() - interval '8 days', now() - interval '8 days' + interval '121 seconds', 'completed', 121000),
  ('30000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', now() - interval '5 days', now() - interval '5 days' + interval '114 seconds', 'completed', 114000),
  ('30000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', now() - interval '2 days', now() - interval '2 days' + interval '107 seconds', 'completed', 107000),
  ('30000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000003', now() - interval '12 days', now() - interval '12 days' + interval '132 seconds', 'completed', 132000),
  ('30000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000003', now() - interval '7 days', now() - interval '7 days' + interval '124 seconds', 'completed', 124000),
  ('30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000003', now() - interval '4 days', now() - interval '4 days' + interval '119 seconds', 'completed', 119000)
on conflict (id) do nothing;

insert into public.session_exercises (
  id, session_id, exercise_id, sequence_number, started_at, completed_at,
  status, configuration, duration_ms, total_attempts, successful_actions,
  accuracy_percent, mean_response_ms, mean_path_deviation, on_path_percent
)
select
  gen_random_uuid(),
  seeded.session_id,
  '20000000-0000-4000-8000-000000000001'::uuid,
  1,
  seeded.started_at,
  seeded.started_at + make_interval(secs => seeded.duration_ms * 0.48 / 1000),
  'completed',
  '{"targetSize":"large","repetitions":6}'::jsonb,
  round(seeded.duration_ms * 0.48)::integer,
  7,
  6,
  seeded.accuracy,
  seeded.response_ms,
  null,
  null
from (
  values
    ('30000000-0000-4000-8000-000000000001'::uuid, now() - interval '9 days', 112000, 75.0, 1840),
    ('30000000-0000-4000-8000-000000000002'::uuid, now() - interval '6 days', 103000, 80.0, 1680),
    ('30000000-0000-4000-8000-000000000003'::uuid, now() - interval '3 days', 95000, 86.0, 1490),
    ('30000000-0000-4000-8000-000000000004'::uuid, now() - interval '8 days', 121000, 71.0, 2010),
    ('30000000-0000-4000-8000-000000000005'::uuid, now() - interval '5 days', 114000, 75.0, 1880),
    ('30000000-0000-4000-8000-000000000006'::uuid, now() - interval '2 days', 107000, 80.0, 1740),
    ('30000000-0000-4000-8000-000000000007'::uuid, now() - interval '12 days', 132000, 67.0, 2310),
    ('30000000-0000-4000-8000-000000000008'::uuid, now() - interval '7 days', 124000, 71.0, 2140),
    ('30000000-0000-4000-8000-000000000009'::uuid, now() - interval '4 days', 119000, 75.0, 1990)
) as seeded(session_id, started_at, duration_ms, accuracy, response_ms)
on conflict (session_id, exercise_id) do nothing;

insert into public.session_exercises (
  id, session_id, exercise_id, sequence_number, started_at, completed_at,
  status, configuration, duration_ms, total_attempts, successful_actions,
  accuracy_percent, mean_response_ms, mean_path_deviation, on_path_percent
)
select
  gen_random_uuid(),
  seeded.session_id,
  '20000000-0000-4000-8000-000000000002'::uuid,
  2,
  seeded.started_at + make_interval(secs => seeded.duration_ms * 0.48 / 1000),
  seeded.started_at + make_interval(secs => seeded.duration_ms / 1000),
  'completed',
  '{"pathWidth":"wide"}'::jsonb,
  round(seeded.duration_ms * 0.52)::integer,
  1,
  1,
  null,
  null,
  seeded.deviation,
  seeded.on_path
from (
  values
    ('30000000-0000-4000-8000-000000000001'::uuid, now() - interval '9 days', 112000, 31.4, 71.0),
    ('30000000-0000-4000-8000-000000000002'::uuid, now() - interval '6 days', 103000, 27.8, 77.0),
    ('30000000-0000-4000-8000-000000000003'::uuid, now() - interval '3 days', 95000, 23.2, 82.0),
    ('30000000-0000-4000-8000-000000000004'::uuid, now() - interval '8 days', 121000, 34.1, 68.0),
    ('30000000-0000-4000-8000-000000000005'::uuid, now() - interval '5 days', 114000, 30.6, 73.0),
    ('30000000-0000-4000-8000-000000000006'::uuid, now() - interval '2 days', 107000, 28.9, 76.0),
    ('30000000-0000-4000-8000-000000000007'::uuid, now() - interval '12 days', 132000, 38.2, 63.0),
    ('30000000-0000-4000-8000-000000000008'::uuid, now() - interval '7 days', 124000, 35.5, 67.0),
    ('30000000-0000-4000-8000-000000000009'::uuid, now() - interval '4 days', 119000, 32.7, 71.0)
) as seeded(session_id, started_at, duration_ms, deviation, on_path)
on conflict (session_id, exercise_id) do nothing;
