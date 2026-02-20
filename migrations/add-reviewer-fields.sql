-- Run this in Supabase SQL Editor
-- Adds reviewer_name and reviewer_email to reviews table
-- Makes user_id optional (not all reviewers will be signed in)

ALTER TABLE reviews 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS reviewer_name varchar(255),
  ADD COLUMN IF NOT EXISTS reviewer_email varchar(255);
