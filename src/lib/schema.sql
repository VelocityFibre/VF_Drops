-- Installations table
CREATE TABLE installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_number VARCHAR(50) NOT NULL UNIQUE,
  contractor_name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  install_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'complete', 'incomplete', 'unpaid')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist steps table
CREATE TABLE checklist_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  phase CHAR(1) NOT NULL CHECK (phase IN ('A', 'B', 'C', 'D', 'E')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  has_photo BOOLEAN DEFAULT FALSE,
  needs_scan BOOLEAN DEFAULT FALSE,
  power_reading DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(installation_id, step_number)
);

-- Index for better performance
CREATE INDEX idx_installations_status ON installations(status);
CREATE INDEX idx_installations_drop_number ON installations(drop_number);
CREATE INDEX idx_checklist_steps_installation ON checklist_steps(installation_id);
CREATE INDEX idx_checklist_steps_phase ON checklist_steps(phase);