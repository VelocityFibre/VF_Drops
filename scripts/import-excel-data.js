const XLSX = require('xlsx');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function importExcelData() {
  try {
    console.log('Reading Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile('docs/1MAP Photos QA Sheet.xlsx');
    
    // Get the Lawley sheet
    if (!workbook.SheetNames.includes('Lawley')) {
      console.error('Lawley sheet not found in Excel file');
      return;
    }
    
    const worksheet = workbook.Sheets['Lawley'];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Found ${data.length} rows in Excel file`);
    
    // Find header row and map columns
    let headerRow = -1;
    let headers = [];
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i][1] === 'Drop Number') {
        headerRow = i;
        headers = data[i];
        break;
      }
    }
    
    if (headerRow === -1) {
      console.error('Could not find header row with "Drop Number"');
      return;
    }
    
    console.log('Headers found:', headers.slice(0, 5)); // Show first 5 headers
    
    // Map column indices
    const columnMap = {
      date: 0,
      dropNumber: 1,
      step1: 2, // Property Frontage
      step2: 3, // Location on Wall (Before Install)
      step3: 4, // Outside Cable Span
      step4: 5, // Home Entry Point – Outside
      step5: 6, // Home Entry Point – Inside
      step6: 7, // Fibre Entry to ONT
      step7: 8, // Patched & Labelled Drop
      step8: 9, // Overall Work Area After Completion
      step9: 10, // ONT Barcode
      step10: 11, // Mini-UPS Serial Number
      step11: 12, // Powermeter Reading
      step12: 13, // Powermeter at ONT
      step13: 14, // Active Broadband Light
      step14: 15, // Customer Signature
      completedPhotos: 16,
      outstandingPhotos: 17,
      user: 18,
      outstandingLoadedTo1MAP: 19,
      comment: 20
    };
    
    // Clear existing data first
    console.log('Clearing existing QA review data...');
    await sql`DELETE FROM qa_photo_reviews`;
    
    let importCount = 0;
    
    // Process data rows (skip header)
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row[columnMap.dropNumber]) {
        continue; // Skip empty rows
      }
      
      try {
        const dropNumber = row[columnMap.dropNumber];
        const dateValue = row[columnMap.date];
        const user = row[columnMap.user] || 'Unknown';
        
        // Parse date - Excel dates can be serial numbers or strings
        let reviewDate;
        if (typeof dateValue === 'number') {
          // Excel date serial number
          const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
          reviewDate = excelDate.toISOString().split('T')[0];
        } else if (typeof dateValue === 'string') {
          reviewDate = new Date(dateValue).toISOString().split('T')[0];
        } else {
          reviewDate = new Date().toISOString().split('T')[0]; // Default to today
        }
        
        // Parse boolean values - Excel uses TRUE/FALSE or 1/0
        const parseBoolean = (value) => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') return value.toLowerCase() === 'true';
          if (typeof value === 'number') return value === 1;
          return false;
        };
        
        const step1 = parseBoolean(row[columnMap.step1]);
        const step2 = parseBoolean(row[columnMap.step2]);
        const step3 = parseBoolean(row[columnMap.step3]);
        const step4 = parseBoolean(row[columnMap.step4]);
        const step5 = parseBoolean(row[columnMap.step5]);
        const step6 = parseBoolean(row[columnMap.step6]);
        const step7 = parseBoolean(row[columnMap.step7]);
        const step8 = parseBoolean(row[columnMap.step8]);
        const step9 = parseBoolean(row[columnMap.step9]);
        const step10 = parseBoolean(row[columnMap.step10]);
        const step11 = parseBoolean(row[columnMap.step11]);
        const step12 = parseBoolean(row[columnMap.step12]);
        const step13 = parseBoolean(row[columnMap.step13]);
        const step14 = parseBoolean(row[columnMap.step14]);
        
        const outstandingLoadedTo1MAP = parseBoolean(row[columnMap.outstandingLoadedTo1MAP]);
        const comment = row[columnMap.comment] || '';
        
        // Insert into database
        await sql`
          INSERT INTO qa_photo_reviews (
            drop_number, review_date, user_name,
            step_01_property_frontage, step_02_location_before_install, step_03_outside_cable_span,
            step_04_home_entry_outside, step_05_home_entry_inside, step_06_fibre_entry_to_ont,
            step_07_patched_labelled_drop, step_08_work_area_completion, step_09_ont_barcode_scan,
            step_10_ups_serial_number, step_11_powermeter_reading, step_12_powermeter_at_ont,
            step_13_active_broadband_light, step_14_customer_signature,
            outstanding_photos_loaded_to_1map, comment
          ) VALUES (
            ${dropNumber}, ${reviewDate}, ${user},
            ${step1}, ${step2}, ${step3}, ${step4}, ${step5}, ${step6},
            ${step7}, ${step8}, ${step9}, ${step10}, ${step11}, ${step12},
            ${step13}, ${step14}, ${outstandingLoadedTo1MAP}, ${comment}
          )
          ON CONFLICT (drop_number, review_date) 
          DO UPDATE SET
            user_name = EXCLUDED.user_name,
            step_01_property_frontage = EXCLUDED.step_01_property_frontage,
            step_02_location_before_install = EXCLUDED.step_02_location_before_install,
            step_03_outside_cable_span = EXCLUDED.step_03_outside_cable_span,
            step_04_home_entry_outside = EXCLUDED.step_04_home_entry_outside,
            step_05_home_entry_inside = EXCLUDED.step_05_home_entry_inside,
            step_06_fibre_entry_to_ont = EXCLUDED.step_06_fibre_entry_to_ont,
            step_07_patched_labelled_drop = EXCLUDED.step_07_patched_labelled_drop,
            step_08_work_area_completion = EXCLUDED.step_08_work_area_completion,
            step_09_ont_barcode_scan = EXCLUDED.step_09_ont_barcode_scan,
            step_10_ups_serial_number = EXCLUDED.step_10_ups_serial_number,
            step_11_powermeter_reading = EXCLUDED.step_11_powermeter_reading,
            step_12_powermeter_at_ont = EXCLUDED.step_12_powermeter_at_ont,
            step_13_active_broadband_light = EXCLUDED.step_13_active_broadband_light,
            step_14_customer_signature = EXCLUDED.step_14_customer_signature,
            outstanding_photos_loaded_to_1map = EXCLUDED.outstanding_photos_loaded_to_1map,
            comment = EXCLUDED.comment,
            updated_at = NOW()
        `;
        
        importCount++;
        
        if (importCount % 10 === 0) {
          console.log(`Imported ${importCount} records...`);
        }
        
      } catch (error) {
        console.error(`Error importing row ${i}:`, error.message);
        console.log('Row data:', row.slice(0, 10)); // Show first 10 columns for debugging
      }
    }
    
    console.log(`\n✅ Successfully imported ${importCount} QA photo reviews`);
    
    // Show summary
    const summary = await sql`
      SELECT 
        user_name,
        COUNT(*) as total_reviews,
        AVG(completed_photos) as avg_completed,
        AVG(outstanding_photos) as avg_outstanding
      FROM qa_photo_reviews 
      GROUP BY user_name
      ORDER BY total_reviews DESC
    `;
    
    console.log('\n📊 Import Summary:');
    summary.forEach(user => {
      console.log(`  ${user.user_name}: ${user.total_reviews} reviews, avg completed: ${Math.round(user.avg_completed)}, avg outstanding: ${Math.round(user.avg_outstanding)}`);
    });
    
  } catch (error) {
    console.error('Error importing Excel data:', error);
    process.exit(1);
  }
}

importExcelData();