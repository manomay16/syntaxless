-- Add coding_mode column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS coding_mode TEXT DEFAULT 'natural_language' CHECK (coding_mode IN ('natural_language', 'code'));

-- Update existing projects to have natural_language as default
UPDATE projects 
SET coding_mode = 'natural_language' 
WHERE coding_mode IS NULL;

