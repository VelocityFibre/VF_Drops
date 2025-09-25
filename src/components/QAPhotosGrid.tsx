'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, ModuleRegistry, AllCommunityModule, themeAlpine, CellEditingStoppedEvent } from 'ag-grid-community';
import { useEffect, useState } from 'react';
import { QAPhotoReview } from '@/types/qa-photos';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function QAPhotosGrid() {
  const [qaReviews, setQAReviews] = useState<QAPhotoReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchQAReviews();
  }, [selectedUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQAReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUser) {
        params.append('user', selectedUser);
      }
      
      const response = await fetch(`/api/qa-photos?${params}`);
      const data = await response.json();
      
      // Check if the response is successful and data is an array
      if (response.ok && Array.isArray(data)) {
        setQAReviews(data);
        
        // Extract unique users for filter
        const uniqueUsers = [...new Set(data.map((review: QAPhotoReview) => review.user_name))] as string[];
        setUsers(uniqueUsers);
      } else {
        console.error('API Error:', data);
        setQAReviews([]);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching QA reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, field: string, value: boolean) => {
    try {
      const response = await fetch('/api/qa-photos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      // Refresh data
      fetchQAReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const CheckboxCellRenderer = (params: { value: boolean; data: QAPhotoReview; colDef: { field: string } }) => {
    const { value, data, colDef } = params;
    const field = colDef.field;
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      updateReview(data.id, field, event.target.checked);
    };
    
    return (
      <div className="flex items-center justify-center h-full">
        <input 
          type="checkbox" 
          checked={value || false}
          onChange={handleChange}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
        />
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      field: 'review_date',
      headerName: 'Date',
      width: 90,
      pinned: 'left',
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      }
    },
    {
      field: 'drop_number',
      headerName: 'Drop Number',
      width: 110,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold', fontSize: '12px' }
    },
    {
      field: 'step_01_property_frontage',
      headerName: 'S1: Property Frontage',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipField: 'step_01_property_frontage',
      tooltipValueGetter: () => 'Step 1: Property Frontage – house, street number visible'
    },
    {
      field: 'step_02_location_before_install',
      headerName: 'S2: Location Before',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 2: Location on Wall (Before Install)'
    },
    {
      field: 'step_03_outside_cable_span',
      headerName: 'S3: Cable Span',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 3: Outside Cable Span (Pole → Pigtail screw)'
    },
    {
      field: 'step_04_home_entry_outside',
      headerName: 'S4: Entry Out',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 4: Home Entry Point – Outside'
    },
    {
      field: 'step_05_home_entry_inside',
      headerName: 'S5: Entry In',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 5: Home Entry Point – Inside'
    },
    {
      field: 'step_06_fibre_entry_to_ont',
      headerName: 'S6: Fibre->ONT',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 6: Fibre Entry to ONT (After Install)'
    },
    {
      field: 'step_07_patched_labelled_drop',
      headerName: 'S7: Patched',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 7: Patched & Labelled Drop'
    },
    {
      field: 'step_08_work_area_completion',
      headerName: 'S8: Work Area',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 8: Overall Work Area After Completion'
    },
    {
      field: 'step_09_ont_barcode_scan',
      headerName: 'S9: ONT Code',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 9: ONT Barcode – Scan barcode + photo of label'
    },
    {
      field: 'step_10_ups_serial_number',
      headerName: 'S10: UPS SN',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 10: Mini-UPS Serial Number (Gizzu)'
    },
    {
      field: 'step_11_powermeter_reading',
      headerName: 'S11: Power Drop',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 11: Powermeter Reading (Drop/Feeder)'
    },
    {
      field: 'step_12_powermeter_at_ont',
      headerName: 'S12: Power ONT',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 12: Powermeter at ONT (Before Activation)'
    },
    {
      field: 'step_13_active_broadband_light',
      headerName: 'S13: BB Light',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 13: Active Broadband Light'
    },
    {
      field: 'step_14_customer_signature',
      headerName: 'S14: Signature',
      width: 70,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' },
      tooltipValueGetter: () => 'Step 14: Customer Signature'
    },
    {
      field: 'completed_photos',
      headerName: 'Completed',
      width: 80,
      cellStyle: { 
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#e6f7ff',
        fontSize: '12px'
      }
    },
    {
      field: 'outstanding_photos',
      headerName: 'Outstanding',
      width: 80,
      cellStyle: (params) => ({
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: params.value > 0 ? '#fff2e6' : '#f6ffed',
        color: params.value > 0 ? '#d4380d' : '#52c41a',
        fontSize: '12px'
      })
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 90,
      pinned: 'right',
      cellStyle: { fontWeight: 'bold', fontSize: '11px' }
    },
    {
      field: 'outstanding_photos_loaded_to_1map',
      headerName: '1MAP',
      width: 50,
      cellRenderer: (params: { value: boolean }) => {
        return (
          <div className="flex items-center justify-center h-full">
            {params.value ? '✓' : '✗'}
          </div>
        );
      },
      cellStyle: (params) => ({
        textAlign: 'center',
        color: params.value ? '#52c41a' : '#d4380d',
        fontWeight: 'bold',
        fontSize: '14px'
      }),
      tooltipValueGetter: (params) => params.value ? 'Outstanding photos loaded to 1MAP' : 'Outstanding photos NOT loaded to 1MAP'
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 150,
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellStyle: { fontSize: '11px' }
    }
  ];

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: false,
    minWidth: 50,
    suppressSizeToFit: false
  };

  const onGridReady = (_params: GridReadyEvent) => {
    // Don't auto-fit - let our manual widths be used
    // params.api.sizeColumnsToFit();
  };

  const onCellEditingStopped = (event: CellEditingStoppedEvent) => {
    if (event.oldValue !== event.newValue && event.colDef.field === 'comment') {
      updateReview(event.data.id, 'comment', event.newValue);
    }
  };

  // No need for global function anymore - using direct event handlers

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalCompleted = qaReviews.reduce((sum, review) => sum + review.completed_photos, 0);
  const totalOutstanding = qaReviews.reduce((sum, review) => sum + review.outstanding_photos, 0);

  return (
    <div className="w-full h-[calc(100vh-200px)] p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <h2 className="text-xl font-semibold">QA Photos Review ({qaReviews.length} drops)</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">
              Total Completed: {totalCompleted}
            </span>
            <span className="text-orange-600 font-medium">
              Total Outstanding: {totalOutstanding}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchQAReviews}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="w-full h-full">
        <AgGridReact
          theme={themeAlpine}
          rowData={qaReviews}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onCellEditingStopped={onCellEditingStopped}
          pagination={true}
          paginationPageSize={25}
          animateRows={true}
          rowSelection={{ mode: 'singleRow' }}
          suppressClickEdit={false}
          suppressHorizontalScroll={false}
        />
      </div>
    </div>
  );
}