-- Sample installations data for testing
INSERT INTO installations (
  drop_number, 
  contractor_name, 
  customer_name, 
  address, 
  status, 
  completion_percentage,
  date_submitted,
  ont_barcode,
  ups_serial_number
) VALUES 
('VF001', 'John Smith Contracting', 'Sarah Johnson', '123 Oak Street, Cape Town', 'submitted', 0, NOW() - INTERVAL '2 hours', NULL, NULL),
('VF002', 'TechInstall Pro', 'Mike Williams', '456 Pine Avenue, Stellenbosch', 'under_review', 75, NOW() - INTERVAL '1 day', 'ONT001234', 'UPS001234'),
('VF003', 'FiberLink Solutions', 'Emma Brown', '789 Cedar Road, Durban', 'complete', 100, NOW() - INTERVAL '3 days', 'ONT001235', 'UPS001235'),
('VF004', 'John Smith Contracting', 'David Wilson', '321 Maple Drive, Johannesburg', 'incomplete', 60, NOW() - INTERVAL '2 days', 'ONT001236', NULL),
('VF005', 'ConnectFast', 'Lisa Davis', '654 Birch Lane, Pretoria', 'unpaid', 85, NOW() - INTERVAL '1 week', 'ONT001237', 'UPS001237'),
('VF006', 'TechInstall Pro', 'Robert Taylor', '987 Elm Street, Port Elizabeth', 'submitted', 0, NOW() - INTERVAL '30 minutes', NULL, NULL),
('VF007', 'FiberLink Solutions', 'Jennifer Miller', '147 Willow Way, East London', 'under_review', 45, NOW() - INTERVAL '6 hours', 'ONT001238', NULL),
('VF008', 'ConnectFast', 'Christopher Anderson', '258 Spruce Court, Bloemfontein', 'complete', 100, NOW() - INTERVAL '5 days', 'ONT001239', 'UPS001239'),
('VF009', 'John Smith Contracting', 'Amanda Martinez', '369 Poplar Plaza, Kimberley', 'incomplete', 30, NOW() - INTERVAL '4 days', NULL, NULL),
('VF010', 'TechInstall Pro', 'Kevin Thompson', '741 Ash Avenue, Polokwane', 'submitted', 15, NOW() - INTERVAL '1 hour', NULL, NULL);

-- Update some review information for processed installations
UPDATE installations SET 
  reviewed_by = 'Agent Smith',
  date_reviewed = NOW() - INTERVAL '2 days',
  agent_notes = 'All checklist items completed successfully. Good quality work.'
WHERE drop_number = 'VF003';

UPDATE installations SET 
  reviewed_by = 'Agent Jones',
  date_reviewed = NOW() - INTERVAL '1 day',
  agent_notes = 'Missing photos for steps 4 and 7. Contractor needs to resubmit evidence.'
WHERE drop_number = 'VF004';

UPDATE installations SET 
  reviewed_by = 'Agent Davis',
  date_reviewed = NOW() - INTERVAL '6 days',
  agent_notes = 'Installation complete but payment held due to customer complaint about cable routing.'
WHERE drop_number = 'VF005';

-- Create some sample checklist item completions
-- For VF002 (under review - 75% complete)
INSERT INTO installation_checklist_items (installation_id, step_id, is_completed, date_completed, photo_url) 
SELECT 
  (SELECT id FROM installations WHERE drop_number = 'VF002'),
  id,
  true,
  NOW() - INTERVAL '1 day',
  CASE 
    WHEN step_number <= 10 THEN '/uploads/vf002/step_' || step_number || '.jpg'
    ELSE NULL
  END
FROM checklist_steps 
WHERE step_number <= 10
ON CONFLICT (installation_id, step_id) DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  date_completed = EXCLUDED.date_completed,
  photo_url = EXCLUDED.photo_url;

-- For VF003 (complete - 100%)
INSERT INTO installation_checklist_items (installation_id, step_id, is_completed, date_completed, photo_url, measurement_value) 
SELECT 
  (SELECT id FROM installations WHERE drop_number = 'VF003'),
  id,
  true,
  NOW() - INTERVAL '3 days',
  '/uploads/vf003/step_' || step_number || '.jpg',
  CASE 
    WHEN step_number = 11 THEN '-18.5 dBm'
    WHEN step_number = 12 THEN '-16.2 dBm'
    ELSE NULL
  END
FROM checklist_steps
ON CONFLICT (installation_id, step_id) DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  date_completed = EXCLUDED.date_completed,
  photo_url = EXCLUDED.photo_url,
  measurement_value = EXCLUDED.measurement_value;

-- For VF004 (incomplete - 60% complete)
INSERT INTO installation_checklist_items (installation_id, step_id, is_completed, date_completed, photo_url, agent_feedback) 
SELECT 
  (SELECT id FROM installations WHERE drop_number = 'VF004'),
  id,
  CASE WHEN step_number <= 8 THEN true ELSE false END,
  CASE WHEN step_number <= 8 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
  CASE 
    WHEN step_number <= 6 THEN '/uploads/vf004/step_' || step_number || '.jpg'
    WHEN step_number IN (7, 8) THEN NULL
    ELSE NULL
  END,
  CASE 
    WHEN step_number = 7 THEN 'Photo required - drop label not visible'
    WHEN step_number = 8 THEN 'Missing photo of completed work area'
    ELSE NULL
  END
FROM checklist_steps
ON CONFLICT (installation_id, step_id) DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  date_completed = EXCLUDED.date_completed,
  photo_url = EXCLUDED.photo_url,
  agent_feedback = EXCLUDED.agent_feedback;