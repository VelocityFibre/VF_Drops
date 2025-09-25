import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let result;
    
    if (!user && !startDate && !endDate) {
      // No filters - get all data
      result = await sql`
        SELECT 
          id,
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
          completed_photos,
          outstanding_photos,
          outstanding_photos_loaded_to_1map,
          comment,
          created_at,
          updated_at
        FROM qa_photo_reviews 
        ORDER BY review_date DESC, drop_number ASC
      `;
    } else {
      // Apply filters based on what's provided
      if (user && !startDate && !endDate) {
        result = await sql`
          SELECT 
            id, drop_number, review_date, user_name,
            step_01_property_frontage, step_02_location_before_install,
            step_03_outside_cable_span, step_04_home_entry_outside,
            step_05_home_entry_inside, step_06_fibre_entry_to_ont,
            step_07_patched_labelled_drop, step_08_work_area_completion,
            step_09_ont_barcode_scan, step_10_ups_serial_number,
            step_11_powermeter_reading, step_12_powermeter_at_ont,
            step_13_active_broadband_light, step_14_customer_signature,
            completed_photos, outstanding_photos,
            outstanding_photos_loaded_to_1map, comment,
            created_at, updated_at
          FROM qa_photo_reviews 
          WHERE user_name = ${user}
          ORDER BY review_date DESC, drop_number ASC
        `;
      } else {
        // For complex filtering, fall back to basic query for now
        result = await sql`
          SELECT 
            id, drop_number, review_date, user_name,
            step_01_property_frontage, step_02_location_before_install,
            step_03_outside_cable_span, step_04_home_entry_outside,
            step_05_home_entry_inside, step_06_fibre_entry_to_ont,
            step_07_patched_labelled_drop, step_08_work_area_completion,
            step_09_ont_barcode_scan, step_10_ups_serial_number,
            step_11_powermeter_reading, step_12_powermeter_at_ont,
            step_13_active_broadband_light, step_14_customer_signature,
            completed_photos, outstanding_photos,
            outstanding_photos_loaded_to_1map, comment,
            created_at, updated_at
          FROM qa_photo_reviews 
          ORDER BY review_date DESC, drop_number ASC
        `;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching QA photo reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QA photo reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      drop_number, 
      review_date,
      user_name,
      step_01_property_frontage = false,
      step_02_location_before_install = false,
      step_03_outside_cable_span = false,
      step_04_home_entry_outside = false,
      step_05_home_entry_inside = false,
      step_06_fibre_entry_to_ont = false,
      step_07_patched_labelled_drop = false,
      step_08_work_area_completion = false,
      step_09_ont_barcode_scan = false,
      step_10_ups_serial_number = false,
      step_11_powermeter_reading = false,
      step_12_powermeter_at_ont = false,
      step_13_active_broadband_light = false,
      step_14_customer_signature = false,
      outstanding_photos_loaded_to_1map = false,
      comment
    } = data;

    const result = await sql`
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
      ) VALUES (
        ${drop_number}, 
        ${review_date || new Date().toISOString().split('T')[0]},
        ${user_name},
        ${step_01_property_frontage},
        ${step_02_location_before_install},
        ${step_03_outside_cable_span},
        ${step_04_home_entry_outside},
        ${step_05_home_entry_inside},
        ${step_06_fibre_entry_to_ont},
        ${step_07_patched_labelled_drop},
        ${step_08_work_area_completion},
        ${step_09_ont_barcode_scan},
        ${step_10_ups_serial_number},
        ${step_11_powermeter_reading},
        ${step_12_powermeter_at_ont},
        ${step_13_active_broadband_light},
        ${step_14_customer_signature},
        ${outstanding_photos_loaded_to_1map},
        ${comment}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating QA photo review:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'QA review already exists for this drop number and date' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create QA photo review' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // For now, handle specific field updates that we know about
    let result;
    
    // Check if it's a step update (boolean field)
    const stepFields = [
      'step_01_property_frontage', 'step_02_location_before_install',
      'step_03_outside_cable_span', 'step_04_home_entry_outside',
      'step_05_home_entry_inside', 'step_06_fibre_entry_to_ont',
      'step_07_patched_labelled_drop', 'step_08_work_area_completion',
      'step_09_ont_barcode_scan', 'step_10_ups_serial_number',
      'step_11_powermeter_reading', 'step_12_powermeter_at_ont',
      'step_13_active_broadband_light', 'step_14_customer_signature'
    ];
    
    const stepField = Object.keys(updateData).find(key => stepFields.includes(key));
    
    if (stepField && updateData[stepField] !== undefined) {
      // Update a step field
      const stepValue = updateData[stepField];
      
      // Use a switch statement to handle each step field
      switch (stepField) {
        case 'step_01_property_frontage':
          result = await sql`UPDATE qa_photo_reviews SET step_01_property_frontage = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_02_location_before_install':
          result = await sql`UPDATE qa_photo_reviews SET step_02_location_before_install = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_03_outside_cable_span':
          result = await sql`UPDATE qa_photo_reviews SET step_03_outside_cable_span = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_04_home_entry_outside':
          result = await sql`UPDATE qa_photo_reviews SET step_04_home_entry_outside = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_05_home_entry_inside':
          result = await sql`UPDATE qa_photo_reviews SET step_05_home_entry_inside = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_06_fibre_entry_to_ont':
          result = await sql`UPDATE qa_photo_reviews SET step_06_fibre_entry_to_ont = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_07_patched_labelled_drop':
          result = await sql`UPDATE qa_photo_reviews SET step_07_patched_labelled_drop = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_08_work_area_completion':
          result = await sql`UPDATE qa_photo_reviews SET step_08_work_area_completion = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_09_ont_barcode_scan':
          result = await sql`UPDATE qa_photo_reviews SET step_09_ont_barcode_scan = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_10_ups_serial_number':
          result = await sql`UPDATE qa_photo_reviews SET step_10_ups_serial_number = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_11_powermeter_reading':
          result = await sql`UPDATE qa_photo_reviews SET step_11_powermeter_reading = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_12_powermeter_at_ont':
          result = await sql`UPDATE qa_photo_reviews SET step_12_powermeter_at_ont = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_13_active_broadband_light':
          result = await sql`UPDATE qa_photo_reviews SET step_13_active_broadband_light = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        case 'step_14_customer_signature':
          result = await sql`UPDATE qa_photo_reviews SET step_14_customer_signature = ${stepValue}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid step field' },
            { status: 400 }
          );
      }
    } else if (updateData.comment !== undefined) {
      // Update comment
      result = await sql`UPDATE qa_photo_reviews SET comment = ${updateData.comment}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    } else {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'QA photo review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating QA photo review:', error);
    return NextResponse.json(
      { error: 'Failed to update QA photo review' },
      { status: 500 }
    );
  }
}
