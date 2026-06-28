-- Starter template — User role, favourites, bookings & inspections
-- Migration 009

-- ---------------------------------------------------------------------------
-- 1. Extend user_role enum with 'user'
-- ---------------------------------------------------------------------------

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';

-- ---------------------------------------------------------------------------
-- 2. Add country column to users
-- ---------------------------------------------------------------------------

ALTER TABLE users ADD COLUMN IF NOT EXISTS country text;

-- ---------------------------------------------------------------------------
-- 3. Update handle_new_user trigger to default to 'user' role
--    (staff are promoted to agent/admin by an administrator)
-- ---------------------------------------------------------------------------

-- All new signups default to 'user'. Role can only be elevated by an admin.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 4. Helper: is_site_user() — authenticated, non-suspended site user
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_site_user()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'user'
      AND suspended_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---------------------------------------------------------------------------
-- 5. user_favourites
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_favourites (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id  uuid        REFERENCES listings   ON DELETE CASCADE NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, listing_id)
);

ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_favourites_own ON user_favourites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_favourites_staff_read ON user_favourites
  FOR SELECT USING (is_staff());

-- ---------------------------------------------------------------------------
-- 6. user_bookings
-- ---------------------------------------------------------------------------

CREATE TYPE IF NOT EXISTS booking_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed'
);

CREATE TABLE IF NOT EXISTS user_bookings (
  id            uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid            REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id    uuid            REFERENCES listings   ON DELETE CASCADE NOT NULL,
  scheduled_at  timestamptz     NOT NULL,
  status        booking_status  DEFAULT 'pending' NOT NULL,
  notes         text,
  created_at    timestamptz     DEFAULT now() NOT NULL,
  updated_at    timestamptz     DEFAULT now() NOT NULL
);

ALTER TABLE user_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_bookings_own ON user_bookings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_bookings_staff_all ON user_bookings
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- 7. user_inspections
-- ---------------------------------------------------------------------------

CREATE TYPE IF NOT EXISTS inspection_status AS ENUM (
  'registered', 'attended', 'cancelled'
);

CREATE TABLE IF NOT EXISTS user_inspections (
  id               uuid               DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid               REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  listing_id       uuid               REFERENCES listings   ON DELETE CASCADE NOT NULL,
  inspection_date  date               NOT NULL,
  inspection_time  time               NOT NULL,
  status           inspection_status  DEFAULT 'registered' NOT NULL,
  notes            text,
  created_at       timestamptz        DEFAULT now() NOT NULL,
  updated_at       timestamptz        DEFAULT now() NOT NULL
);

ALTER TABLE user_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_inspections_own ON user_inspections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_inspections_staff_all ON user_inspections
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- 8. updated_at auto-sync triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_bookings_updated_at
  BEFORE UPDATE ON user_bookings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER user_inspections_updated_at
  BEFORE UPDATE ON user_inspections
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
