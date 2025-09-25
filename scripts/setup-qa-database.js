const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('Setting up QA Photos database tables...');
    
    // Create qa_photo_reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS qa_photo_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        drop_number VARCHAR(50) NOT NULL,
        review_date DATE NOT NULL DEFAULT CURRENT_DATE,
        user_name VARCHAR(100) NOT NULL,
        
        -- Step completion fields (matching Excel columns)
        step_01_property_frontage BOOLEAN DEFAULT FALSE,
        step_02_location_before_install BOOLEAN DEFAULT FALSE,
        step_03_outside_cable_span BOOLEAN DEFAULT FALSE,
        step_04_home_entry_outside BOOLEAN DEFAULT FALSE,
        step_05_home_entry_inside BOOLEAN DEFAULT FALSE,
        step_06_fibre_entry_to_ont BOOLEAN DEFAULT FALSE,
        step_07_patched_labelled_drop BOOLEAN DEFAULT FALSE,
        step_08_work_area_completion BOOLEAN DEFAULT FALSE,
        step_09_ont_barcode_scan BOOLEAN DEFAULT FALSE,
        step_10_ups_serial_number BOOLEAN DEFAULT FALSE,
        step_11_powermeter_reading BOOLEAN DEFAULT FALSE,
        step_12_powermeter_at_ont BOOLEAN DEFAULT FALSE,
        step_13_active_broadband_light BOOLEAN DEFAULT FALSE,
        step_14_customer_signature BOOLEAN DEFAULT FALSE,
        
        -- Summary fields
        completed_photos INTEGER GENERATED ALWAYS AS (
          (CASE WHEN step_01_property_frontage THEN 1 ELSE 0 END) +
          (CASE WHEN step_02_location_before_install THEN 1 ELSE 0 END) +
          (CASE WHEN step_03_outside_cable_span THEN 1 ELSE 0 END) +
          (CASE WHEN step_04_home_entry_outside THEN 1 ELSE 0 END) +
          (CASE WHEN step_05_home_entry_inside THEN 1 ELSE 0 END) +
          (CASE WHEN step_06_fibre_entry_to_ont THEN 1 ELSE 0 END) +
          (CASE WHEN step_07_patched_labelled_drop THEN 1 ELSE 0 END) +
          (CASE WHEN step_08_work_area_completion THEN 1 ELSE 0 END) +
          (CASE WHEN step_09_ont_barcode_scan THEN 1 ELSE 0 END) +
          (CASE WHEN step_10_ups_serial_number THEN 1 ELSE 0 END) +
          (CASE WHEN step_11_powermeter_reading THEN 1 ELSE 0 END) +
          (CASE WHEN step_12_powermeter_at_ont THEN 1 ELSE 0 END) +
          (CASE WHEN step_13_active_broadband_light THEN 1 ELSE 0 END) +
          (CASE WHEN step_14_customer_signature THEN 1 ELSE 0 END)
        ) STORED,
        
        outstanding_photos INTEGER GENERATED ALWAYS AS (
          14 - (
            (CASE WHEN step_01_property_frontage THEN 1 ELSE 0 END) +
            (CASE WHEN step_02_location_before_install THEN 1 ELSE 0 END) +
            (CASE WHEN step_03_outside_cable_span THEN 1 ELSE 0 END) +
            (CASE WHEN step_04_home_entry_outside THEN 1 ELSE 0 END) +
            (CASE WHEN step_05_home_entry_inside THEN 1 ELSE 0 END) +
            (CASE WHEN step_06_fibre_entry_to_ont THEN 1 ELSE 0 END) +
            (CASE WHEN step_07_patched_labelled_drop THEN 1 ELSE 0 END) +
            (CASE WHEN step_08_work_area_completion THEN 1 ELSE 0 END) +
            (CASE WHEN step_09_ont_barcode_scan THEN 1 ELSE 0 END) +
            (CASE WHEN step_10_ups_serial_number THEN 1 ELSE 0 END) +
            (CASE WHEN step_11_powermeter_reading THEN 1 ELSE 0 END) +
            (CASE WHEN step_12_powermeter_at_ont THEN 1 ELSE 0 END) +
            (CASE WHEN step_13_active_broadband_light THEN 1 ELSE 0 END) +
            (CASE WHEN step_14_customer_signature THEN 1 ELSE 0 END)
          )
        ) STORED,
        
        outstanding_photos_loaded_to_1map BOOLEAN DEFAULT FALSE,
        comment TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Ensure unique entry per drop number and date
        UNIQUE(drop_number, review_date)
      )
    `;
    
    console.log('✓ Created qa_photo_reviews table');
    
    // Create qa_review_steps table
    await sql`
      CREATE TABLE IF NOT EXISTS qa_review_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        step_number INTEGER NOT NULL UNIQUE,
        step_title VARCHAR(200) NOT NULL,
        step_description TEXT NOT NULL
      )
    `;
    
    console.log('✓ Created qa_review_steps table');
    
    // Insert the 14 QA review steps if they don't exist
    const existingSteps = await sql`SELECT COUNT(*) as count FROM qa_review_steps`;
    
    if (existingSteps[0].count === 0) {
      await sql`
        INSERT INTO qa_review_steps (step_number, step_title, step_description) VALUES
        (1, 'Property Frontage – house, street number visible', 'Wide shot of house, street number visible'),
        (2, 'Location on Wall (Before Install)', 'Show intended ONT spot + power outlet'),
        (3, 'Outside Cable Span (Pole → Pigtail screw)', 'Wide shot showing full span (Pole → Pigtail screw)'),
        (4, 'Home Entry Point – Outside', 'Close-up of pigtail screw/duct entry'),
        (5, 'Home Entry Point – Inside', 'Inside view of same entry penetration'),
        (6, 'Fibre Entry to ONT (After Install)', 'Show slack loop + clips/conduit'),
        (7, 'Patched & Labelled Drop', 'Label with Drop Number visible'),
        (8, 'Overall Work Area After Completion', 'ONT, fibre routing & electrical outlet in frame'),
        (9, 'ONT Barcode – Scan barcode + photo of label', 'Scan barcode + photo of label'),
        (10, 'Mini-UPS Serial Number (Gizzu)', 'Scan/enter serial + photo of label'),
        (11, 'Powermeter Reading (Drop/Feeder)', 'Enter dBm + photo of meter screen'),
        (12, 'Powermeter at ONT (Before Activation)', 'Enter dBm + photo of meter screen. Acceptable: −25 to −10 dBm'),
        (13, 'Active Broadband Light', 'ONT light ON + Fibertime sticker + Drop No.'),
        (14, 'Customer Signature', 'Collect digital signature + customer name in 1Map')
      `;
      
      console.log('✓ Inserted QA review steps');
    } else {
      console.log('✓ QA review steps already exist');
    }
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_qa_photo_reviews_date ON qa_photo_reviews(review_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_qa_photo_reviews_user ON qa_photo_reviews(user_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_qa_photo_reviews_drop_number ON qa_photo_reviews(drop_number)`;
    
    console.log('✓ Created indexes');
    
    // Insert sample data
    const existingReviews = await sql`SELECT COUNT(*) as count FROM qa_photo_reviews`;
    
    if (existingReviews[0].count === 0) {
      console.log('Inserting sample data...');
      
      await sql`
        INSERT INTO qa_photo_reviews (
          drop_number, review_date, user_name,
          step_01_property_frontage, step_02_location_before_install, step_03_outside_cable_span,
          step_04_home_entry_outside, step_05_home_entry_inside, step_06_fibre_entry_to_ont,
          step_07_patched_labelled_drop, step_08_work_area_completion, step_09_ont_barcode_scan,
          step_10_ups_serial_number, step_11_powermeter_reading, step_12_powermeter_at_ont,
          step_13_active_broadband_light, step_14_customer_signature,
          outstanding_photos_loaded_to_1map, comment
        ) VALUES 
        ('DR1751191', '2025-09-23', 'Siwe', false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, 'Multiple photos missing - needs follow up'),
        ('DR1750813', '2025-09-23', 'Tebaleng', true, true, false, true, true, true, true, true, true, true, true, true, true, true, false, 'Good completion, only Step 3 missing'),
        ('DR1750901', '2025-09-23', 'Lwandile', false, true, false, true, true, true, true, false, true, true, true, true, true, true, false, 'Property frontage and cable span photos needed'),
        ('DR1750817', '2025-09-23', 'Thato', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, 'Complete - all photos verified'),
        ('DR1748567', '2025-09-23', 'Mxolisi', true, false, true, true, false, true, true, false, true, true, true, true, true, true, false, 'Location and work area photos missing'),
        ('DR1752001', '2025-09-24', 'Siwe', true, true, true, false, false, false, true, true, false, true, false, true, true, false, false, 'Entry point photos needed'),
        ('DR1752002', '2025-09-24', 'Tebaleng', true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, 'Excellent work - all complete'),
        ('DR1752003', '2025-09-24', 'Lwandile', false, false, true, true, true, false, false, true, true, false, true, false, true, true, false, 'Several missing photos'),
        ('DR1752004', '2025-09-24', 'Thato', true, true, false, true, true, true, false, true, true, true, true, true, false, true, false, 'Cable span and labelling issues'),
        ('DR1752101', CURRENT_DATE, 'Mxolisi', true, true, true, true, false, true, true, true, true, true, true, false, true, true, false, 'ONT power reading missing'),
        ('DR1752102', CURRENT_DATE, 'Siwe', false, true, true, true, true, false, true, false, true, true, false, true, false, true, false, 'Multiple completion issues'),
        ('DR1752103', CURRENT_DATE, 'Tebaleng', true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, 'Perfect completion - well done')
      `;
      
      console.log('✓ Inserted sample data');
    } else {
      console.log('✓ QA reviews data already exists');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now use the QA Photos Review system.');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();