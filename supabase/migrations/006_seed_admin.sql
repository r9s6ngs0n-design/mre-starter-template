-- Promote admin by email on public.users (run after creating auth user).
-- Replace the email below before applying.
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com'; -- TODO(client): set the admin user's email.
