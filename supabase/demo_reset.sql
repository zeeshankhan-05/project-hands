-- Run only against the fictional Project H.A.N.D.S. prototype database.
-- This deletes completed session data; rerun `supabase seed --linked` afterward.
truncate table public.input_events, public.session_exercises, public.sessions restart identity cascade;
