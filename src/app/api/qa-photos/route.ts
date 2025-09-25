import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = `
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
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    if (user) {
      query += ` AND user_name = $${queryParams.length + 1}`;
      queryParams.push(user);
    }
    
    if (startDate) {
      query += ` AND review_date >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND review_date <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }
    
    query += ` ORDER BY review_date DESC, drop_number ASC`;
    
    const result = await sql.unsafe(query, queryParams);

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

    // Build dynamic update query
    const updateFields = Object.keys(updateData).filter(key => 
      updateData[key] !== undefined && key !== 'id'
    );
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const setClause = updateFields.map((field, index) => 
      `${field} = $${index + 2}`
    ).join(', ');
    
    const queryText = `
      UPDATE qa_photo_reviews 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const queryParams = [id, ...updateFields.map(field => updateData[field])];
    const result = await sql.unsafe(queryText, queryParams);

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