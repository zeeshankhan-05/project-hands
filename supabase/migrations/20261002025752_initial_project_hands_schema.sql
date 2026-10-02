create table public.participants (
  id uuid primary key default gen_random_uuid(),
  participant_code text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint participants_code_not_blank check (length(trim(participant_code)) > 0),
  constraint participants_name_not_blank check (length(trim(display_name)) > 0)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  constraint exercises_slug_allowed check (slug in ('target-touch', 'path-tracing'))
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'in_progress',
  total_duration_ms integer,
  created_at timestamptz not null default now(),
  constraint sessions_status_allowed check (status in ('in_progress', 'completed', 'abandoned')),
  constraint sessions_duration_nonnegative check (total_duration_ms is null or total_duration_ms >= 0),
  constraint sessions_time_order check (completed_at is null or completed_at >= started_at)
);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  sequence_number smallint not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  status text not null default 'completed',
  configuration jsonb not null default '{}'::jsonb,
  duration_ms integer not null,
  total_attempts integer not null default 0,
  successful_actions integer not null default 0,
  accuracy_percent numeric(5, 2),
  mean_response_ms integer,
  mean_path_deviation numeric(8, 2),
  on_path_percent numeric(5, 2),
  created_at timestamptz not null default now(),
  constraint session_exercises_session_exercise_unique unique (session_id, exercise_id),
  constraint session_exercises_sequence_unique unique (session_id, sequence_number),
  constraint session_exercises_status_allowed check (status in ('completed')),
  constraint session_exercises_duration_nonnegative check (duration_ms >= 0),
  constraint session_exercises_attempts_nonnegative check (total_attempts >= 0 and successful_actions >= 0),
  constraint session_exercises_accuracy_range check (accuracy_percent is null or accuracy_percent between 0 and 100),
  constraint session_exercises_response_nonnegative check (mean_response_ms is null or mean_response_ms >= 0),
  constraint session_exercises_deviation_nonnegative check (mean_path_deviation is null or mean_path_deviation >= 0),
  constraint session_exercises_on_path_range check (on_path_percent is null or on_path_percent between 0 and 100),
  constraint session_exercises_time_order check (completed_at >= started_at)
);

create table public.input_events (
  id bigint generated always as identity primary key,
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  sequence_number integer not null,
  event_type text not null,
  pointer_type text not null,
  x_normalized numeric(8, 7) not null,
  y_normalized numeric(8, 7) not null,
  elapsed_ms integer not null,
  pressure numeric(5, 4),
  outcome text,
  created_at timestamptz not null default now(),
  constraint input_events_sequence_unique unique (session_exercise_id, sequence_number),
  constraint input_events_event_allowed check (event_type in ('pointerdown', 'pointermove', 'pointerup')),
  constraint input_events_pointer_allowed check (pointer_type in ('mouse', 'pen', 'touch', 'unknown')),
  constraint input_events_x_range check (x_normalized between 0 and 1),
  constraint input_events_y_range check (y_normalized between 0 and 1),
  constraint input_events_elapsed_nonnegative check (elapsed_ms >= 0),
  constraint input_events_pressure_range check (pressure is null or pressure between 0 and 1),
  constraint input_events_outcome_allowed check (
    outcome is null or outcome in ('hit', 'miss', 'on-track', 'off-track', 'start', 'finish')
  )
);

create index sessions_participant_completed_idx
  on public.sessions (participant_id, completed_at desc)
  where status = 'completed';

create index session_exercises_session_idx
  on public.session_exercises (session_id, sequence_number);

create index input_events_session_exercise_idx
  on public.input_events (session_exercise_id, sequence_number);

alter table public.participants enable row level security;
alter table public.exercises enable row level security;
alter table public.sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.input_events enable row level security;

revoke all on table public.participants from anon, authenticated;
revoke all on table public.exercises from anon, authenticated;
revoke all on table public.sessions from anon, authenticated;
revoke all on table public.session_exercises from anon, authenticated;
revoke all on table public.input_events from anon, authenticated;

grant all on table public.participants to service_role;
grant all on table public.exercises to service_role;
grant all on table public.sessions to service_role;
grant all on table public.session_exercises to service_role;
grant all on table public.input_events to service_role;
grant usage, select on sequence public.input_events_id_seq to service_role;
