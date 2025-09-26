import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface FilterParams {
  drop_number?: string;
  contractor?: string;
  customer?: string;
  project?: string;
  status?: string;
  dateSubmittedFrom?: string;
  dateSubmittedTo?: string;
  dateReviewedFrom?: string;
  dateReviewedTo?: string;
  reviewedBy?: string;
  address?: string;
  completionPercentageMin?: string;
  completionPercentageMax?: string;
  assigned_agent?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: FilterParams = {
      drop_number: searchParams.get('drop_number') || undefined,
      contractor: searchParams.get('contractor') || undefined,
      customer: searchParams.get('customer') || undefined,
      project: searchParams.get('project') || undefined,
      status: searchParams.get('status') || undefined,
      dateSubmittedFrom: searchParams.get('dateSubmittedFrom') || undefined,
      dateSubmittedTo: searchParams.get('dateSubmittedTo') || undefined,
      dateReviewedFrom: searchParams.get('dateReviewedFrom') || undefined,
      dateReviewedTo: searchParams.get('dateReviewedTo') || undefined,
      reviewedBy: searchParams.get('reviewedBy') || undefined,
      address: searchParams.get('address') || undefined,
      completionPercentageMin: searchParams.get('completionPercentageMin') || undefined,
      completionPercentageMax: searchParams.get('completionPercentageMax') || undefined,
      assigned_agent: searchParams.get('assigned_agent') || undefined,
    };

    // Build dynamic WHERE clause
    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (filters.drop_number) {
      whereConditions.push(`drop_number ILIKE $${paramIndex}`);
      values.push(`%${filters.drop_number}%`);
      paramIndex++;
    }

    if (filters.contractor) {
      whereConditions.push(`contractor_name = $${paramIndex}`);
      values.push(filters.contractor);
      paramIndex++;
    }

    if (filters.customer) {
      whereConditions.push(`customer_name ILIKE $${paramIndex}`);
      values.push(`%${filters.customer}%`);
      paramIndex++;
    }

    if (filters.project) {
      whereConditions.push(`project_name = $${paramIndex}`);
      values.push(filters.project);
      paramIndex++;
    }

    if (filters.status) {
      whereConditions.push(`status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.address) {
      whereConditions.push(`address ILIKE $${paramIndex}`);
      values.push(`%${filters.address}%`);
      paramIndex++;
    }

    if (filters.reviewedBy) {
      whereConditions.push(`reviewed_by = $${paramIndex}`);
      values.push(filters.reviewedBy);
      paramIndex++;
    }

    if (filters.dateSubmittedFrom) {
      whereConditions.push(`date_submitted >= $${paramIndex}`);
      values.push(filters.dateSubmittedFrom);
      paramIndex++;
    }

    if (filters.dateSubmittedTo) {
      whereConditions.push(`date_submitted <= $${paramIndex}`);
      values.push(`${filters.dateSubmittedTo} 23:59:59`);
      paramIndex++;
    }

    if (filters.dateReviewedFrom) {
      whereConditions.push(`date_reviewed >= $${paramIndex}`);
      values.push(filters.dateReviewedFrom);
      paramIndex++;
    }

    if (filters.dateReviewedTo) {
      whereConditions.push(`date_reviewed <= $${paramIndex}`);
      values.push(`${filters.dateReviewedTo} 23:59:59`);
      paramIndex++;
    }

    if (filters.completionPercentageMin) {
      whereConditions.push(`completion_percentage >= $${paramIndex}`);
      values.push(parseInt(filters.completionPercentageMin));
      paramIndex++;
    }

    if (filters.completionPercentageMax) {
      whereConditions.push(`completion_percentage <= $${paramIndex}`);
      values.push(parseInt(filters.completionPercentageMax));
      paramIndex++;
    }

    if (filters.assigned_agent) {
      whereConditions.push(`assigned_agent = $${paramIndex}`);
      values.push(filters.assigned_agent);
      paramIndex++;
    }

    // Build the query using template strings with proper parameterization
    let query;
    if (whereConditions.length === 0) {
      query = sql`
        SELECT 
          id,
          drop_number,
          contractor_name,
          customer_name,
          address,
          project_name,
          status,
          completion_percentage,
          date_submitted,
          date_reviewed,
          reviewed_by,
          agent_notes,
          ont_barcode,
          ups_serial_number,
          assigned_agent,
          created_at,
          updated_at
        FROM installations 
        ORDER BY date_submitted DESC
      `;
    } else {
      // For now, use unsafe query with parameters - this can be refactored later
      const whereClause = whereConditions.join(' AND ');
      const queryString = `
        SELECT 
          id,
          drop_number,
          contractor_name,
          customer_name,
          address,
          project_name,
          status,
          completion_percentage,
          date_submitted,
          date_reviewed,
          reviewed_by,
          agent_notes,
          ont_barcode,
          ups_serial_number,
          assigned_agent,
          created_at,
          updated_at
        FROM installations 
        WHERE ${whereClause}
        ORDER BY date_submitted DESC
      `;
      query = sql.unsafe(queryString, values);
    }

    const result = await query;
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

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, assigned_agent } = data;

    if (!id || !assigned_agent) {
      return NextResponse.json(
        { error: 'ID and assigned_agent are required' },
        { status: 400 }
      );
    }

    // Validate assigned_agent value
    if (!['Unallocated', 'Zander', 'Michael'].includes(assigned_agent)) {
      return NextResponse.json(
        { error: 'Invalid assigned_agent value' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE installations 
      SET assigned_agent = ${assigned_agent}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating installation:', error);
    return NextResponse.json(
      { error: 'Failed to update installation' },
      { status: 500 }
    );
  }
}
