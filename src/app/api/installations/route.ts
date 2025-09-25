import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        drop_number,
        contractor_name,
        customer_name,
        address,
        status,
        completion_percentage,
        date_submitted,
        date_reviewed,
        reviewed_by,
        agent_notes,
        ont_barcode,
        ups_serial_number,
        created_at,
        updated_at
      FROM installations 
      ORDER BY date_submitted DESC
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching installations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      drop_number, 
      contractor_name, 
      customer_name, 
      address, 
      ont_barcode, 
      ups_serial_number 
    } = data;

    const result = await sql`
      INSERT INTO installations (
        drop_number, 
        contractor_name, 
        customer_name, 
        address, 
        ont_barcode, 
        ups_serial_number
      ) VALUES (
        ${drop_number}, 
        ${contractor_name}, 
        ${customer_name}, 
        ${address}, 
        ${ont_barcode}, 
        ${ups_serial_number}
      )
      RETURNING *
    `;

    // Create checklist items for this installation
    const installation = result[0];
    
    // Get all checklist steps
    const steps = await sql`
      SELECT id FROM checklist_steps ORDER BY step_number
    `;

    // Insert checklist items for each step
    for (const step of steps) {
      await sql`
        INSERT INTO installation_checklist_items (installation_id, step_id)
        VALUES (${installation.id}, ${step.id})
      `;
    }

    return NextResponse.json(installation);
  } catch (error) {
    console.error('Error creating installation:', error);
    return NextResponse.json(
      { error: 'Failed to create installation' },
      { status: 500 }
    );
  }
}