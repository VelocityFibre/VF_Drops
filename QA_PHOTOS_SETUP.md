# QA Photos Integration Setup

This document explains how to set up and use the new QA Photos Review system, which replicates the functionality of the Excel "1MAP Photos QA Sheet" (specifically the Lawley sheet) in the VF_Drops application.

## Overview

The QA Photos Review system allows quality assurance reviewers to track photo completion across 14 installation steps for each drop, exactly matching the Excel sheet structure. It provides:

- Interactive checkboxes for each of the 14 QA steps
- Automatic calculation of completed vs outstanding photos
- User filtering and date-based queries
- Real-time updates and inline editing
- Visual indicators for completion status

## Database Setup

### 1. Create the QA Tables

Run the SQL schema to create the necessary tables:

```sql
-- Execute the contents of src/lib/qa-photos-schema.sql
-- This creates:
-- - qa_photo_reviews table (main data)
-- - qa_review_steps table (step definitions)
-- - Appropriate indexes
```

### 2. Load Sample Data (Optional)

To populate with sample data based on the Excel sheet:

```sql
-- Execute the contents of src/lib/qa-sample-data.sql
-- This creates sample QA reviews for testing
```

## Application Structure

### New Files Added

- `src/types/qa-photos.ts` - TypeScript interfaces
- `src/app/api/qa-photos/route.ts` - API endpoints
- `src/components/QAPhotosGrid.tsx` - Main QA grid component
- `src/lib/qa-photos-schema.sql` - Database schema
- `src/lib/qa-sample-data.sql` - Sample data

### Modified Files

- `src/app/page.tsx` - Added navigation between grid views

## Usage

### Navigation

The application now has two views accessible via tabs in the header:
1. **Installations Grid** - Original installations tracking
2. **QA Photos Review** - New QA photos checklist

### QA Photos Review Features

#### Step Completion Tracking
- 14 interactive checkboxes per drop, matching Excel columns:
  1. Property Frontage – house, street number visible
  2. Location on Wall (Before Install)
  3. Outside Cable Span (Pole → Pigtail screw)
  4. Home Entry Point – Outside
  5. Home Entry Point – Inside
  6. Fibre Entry to ONT (After Install)
  7. Patched & Labelled Drop
  8. Overall Work Area After Completion
  9. ONT Barcode – Scan barcode + photo of label
  10. Mini-UPS Serial Number (Gizzu)
  11. Powermeter Reading (Drop/Feeder)
  12. Powermeter at ONT (Before Activation)
  13. Active Broadband Light
  14. Customer Signature

#### Automatic Calculations
- **Completed Photos**: Auto-calculated count of checked steps
- **Outstanding Photos**: Auto-calculated count of unchecked steps (14 - completed)

#### Filtering and Search
- Filter by user/reviewer
- Date range filtering (planned)
- Real-time totals display

#### Status Indicators
- Green highlighting for completed photos
- Orange/red highlighting for outstanding photos
- Color-coded "Outstanding Photos loaded onto 1MAP" status

## API Endpoints

### GET `/api/qa-photos`
Retrieve QA photo reviews with optional filtering:
- `?user=username` - Filter by reviewer
- `?startDate=YYYY-MM-DD` - Filter from date
- `?endDate=YYYY-MM-DD` - Filter to date

### POST `/api/qa-photos`
Create new QA photo review entry

### PUT `/api/qa-photos`
Update existing QA photo review (used for checkbox updates and comments)

## Data Model

### QA Photo Review Fields

```typescript
interface QAPhotoReview {
  id: string;
  drop_number: string;
  review_date: string;
  user_name: string;
  
  // 14 step completion fields (boolean)
  step_01_property_frontage: boolean;
  step_02_location_before_install: boolean;
  // ... (all 14 steps)
  
  // Auto-calculated summary fields
  completed_photos: number;
  outstanding_photos: number;
  
  outstanding_photos_loaded_to_1map: boolean;
  comment?: string;
}
```

## Branch Management

### Current Branch Structure
- `main` - Original installations functionality
- `qa-photos-integration` - New QA photos system

### Switching Between Versions

To use the original system:
```bash
git checkout main
npm run dev
```

To use the QA photos integrated system:
```bash
git checkout qa-photos-integration  
npm run dev
```

## Development Notes

### Excel Sheet Mapping
The system directly maps to the Excel sheet structure:
- Each Excel column becomes a database field
- Checkbox states are stored as booleans
- Calculated columns use PostgreSQL generated columns
- User assignments and comments are preserved

### Performance Considerations
- Database indexes on frequently queried fields (date, user, drop_number)
- Efficient AG Grid rendering with pagination
- Real-time updates minimize full grid refreshes

### Future Enhancements
- Photo upload integration
- Advanced filtering options  
- Export to Excel functionality
- Bulk operations for multiple drops
- Integration with 1MAP system

## Troubleshooting

### Common Issues

1. **Checkboxes not updating**: Check browser console for API errors
2. **Data not loading**: Verify database connection and table existence
3. **Missing users in filter**: Ensure QA reviews exist for those users

### Database Queries for Debugging

```sql
-- Check QA reviews count
SELECT COUNT(*) FROM qa_photo_reviews;

-- View completion statistics
SELECT 
  user_name,
  AVG(completed_photos) as avg_completed,
  AVG(outstanding_photos) as avg_outstanding
FROM qa_photo_reviews 
GROUP BY user_name;

-- Find reviews with most outstanding items
SELECT drop_number, user_name, outstanding_photos, comment
FROM qa_photo_reviews 
WHERE outstanding_photos > 5
ORDER BY outstanding_photos DESC;
```