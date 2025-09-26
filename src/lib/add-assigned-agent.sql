-- Add assigned_agent column to installations table
-- This column will track which agent is assigned to process each installation

ALTER TABLE installations 
ADD COLUMN IF NOT EXISTS assigned_agent VARCHAR(50) NOT NULL DEFAULT 'Unallocated' 
CHECK (assigned_agent IN ('Unallocated', 'Zander', 'Michael'));

-- Add index for better performance when filtering by assigned agent
CREATE INDEX IF NOT EXISTS idx_installations_assigned_agent ON installations(assigned_agent);

-- Update any existing records to have the default value
UPDATE installations SET assigned_agent = 'Unallocated' WHERE assigned_agent IS NULL;