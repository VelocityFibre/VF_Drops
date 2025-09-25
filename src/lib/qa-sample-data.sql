-- Sample QA Photo Review data based on the Excel sheet pattern

-- First, let's insert some sample QA photo reviews
INSERT INTO qa_photo_reviews (
  drop_number, 
  review_date, 
  user_name,
  step_01_property_frontage,
  step_02_location_before_install,
  step_03_outside_cable_span,
  step_04_home_entry_outside,
  step_05_home_entry_inside,
  step_06_fibre_entry_to_ont,
  step_07_patched_labelled_drop,
  step_08_work_area_completion,
  step_09_ont_barcode_scan,
  step_10_ups_serial_number,
  step_11_powermeter_reading,
  step_12_powermeter_at_ont,
  step_13_active_broadband_light,
  step_14_customer_signature,
  outstanding_photos_loaded_to_1map,
  comment
) VALUES 
-- Sample based on Excel data - Mix of complete and incomplete reviews
('DR1751191', '2025-09-23', 'Siwe', false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, 'Multiple photos missing - needs follow up'),

('DR1750813', '2025-09-23', 'Tebaleng', true, true, false, true, true, true, true, true, true, true, true, true, true, true, false, 'Good completion, only Step 3 missing'),

('DR1750901', '2025-09-23', 'Lwandile', false, true, false, true, true, true, true, false, true, true, true, true, true, true, false, 'Property frontage and cable span photos needed'),

('DR1750817', '2025-09-23', 'Thato', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, 'Complete - all photos verified'),

('DR1748567', '2025-09-23', 'Mxolisi', true, false, true, true, false, true, true, false, true, true, true, true, true, true, false, 'Location and work area photos missing'),

-- Add some more recent data
('DR1752001', '2025-09-24', 'Siwe', true, true, true, false, false, false, true, true, false, true, false, true, true, false, false, 'Entry point photos needed'),

('DR1752002', '2025-09-24', 'Tebaleng', true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, 'Excellent work - all complete'),

('DR1752003', '2025-09-24', 'Lwandile', false, false, true, true, true, false, false, true, true, false, true, false, true, true, false, 'Several missing photos'),

('DR1752004', '2025-09-24', 'Thato', true, true, false, true, true, true, false, true, true, true, true, true, false, true, false, 'Cable span and labelling issues'),

-- Add some data for today
('DR1752101', CURRENT_DATE, 'Mxolisi', true, true, true, true, false, true, true, true, true, true, true, false, true, true, false, 'ONT power reading missing'),

('DR1752102', CURRENT_DATE, 'Siwe', false, true, true, true, true, false, true, false, true, true, false, true, false, true, false, 'Multiple completion issues'),

('DR1752103', CURRENT_DATE, 'Tebaleng', true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, 'Perfect completion - well done');

-- Update some entries to show loaded to 1MAP
UPDATE qa_photo_reviews 
SET outstanding_photos_loaded_to_1map = true 
WHERE drop_number IN ('DR1750817', 'DR1752002', 'DR1752103');

-- Add some comments for entries with issues
UPDATE qa_photo_reviews 
SET comment = 'Contractor notified - photos requested by end of day'
WHERE outstanding_photos > 5;

UPDATE qa_photo_reviews 
SET comment = 'Minor issues - acceptable for now'
WHERE outstanding_photos BETWEEN 1 AND 3;