-- ---------------------------------------------------------------------------
-- Add contact_status to leads
-- Simple 3-state lifecycle indicator: new → contacted → closed
-- ---------------------------------------------------------------------------

ALTER TABLE leads
  ADD COLUMN contact_status text NOT NULL DEFAULT 'new'
    CHECK (contact_status IN ('new', 'contacted', 'closed'));
