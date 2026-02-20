-- Add portfolio fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
