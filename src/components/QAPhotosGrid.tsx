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
  }, [selectedUser]);

  const fetchQAReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUser) {
        params.append('user', selectedUser);
      }
      
      const response = await fetch(`/api/qa-photos?${params}`);
      const data = await response.json();
      setQAReviews(data);
      
      // Extract unique users for filter
      const uniqueUsers = [...new Set(data.map((review: QAPhotoReview) => review.user_name))];
      setUsers(uniqueUsers);
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

  const CheckboxCellRenderer = (params: any) => {
    const { value, data, colDef } = params;
    const field = colDef.field;
    
    return `
      <div class="flex items-center justify-center h-full">
        <input 
          type="checkbox" 
          ${value ? 'checked' : ''} 
          onchange="window.updateQAReview('${data.id}', '${field}', this.checked)"
          class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
        />
      </div>
    `;
  };

  const columnDefs: ColDef[] = [
    {
      field: 'review_date',
      headerName: 'Date',
      width: 110,
      pinned: 'left',
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'drop_number',
      headerName: 'Drop Number',
      width: 120,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'step_01_property_frontage',
      headerName: 'Step 1: Property Frontage – house, street number visible',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_02_location_before_install',
      headerName: 'Step 2: Location on Wall (Before Install)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_03_outside_cable_span',
      headerName: 'Step 3: Outside Cable Span (Pole → Pigtail screw)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_04_home_entry_outside',
      headerName: 'Step 4: Home Entry Point – Outside',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_05_home_entry_inside',
      headerName: 'Step 5: Home Entry Point – Inside',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_06_fibre_entry_to_ont',
      headerName: 'Step 6: Fibre Entry to ONT (After Install)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_07_patched_labelled_drop',
      headerName: 'Step 7: Patched & Labelled Drop',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_08_work_area_completion',
      headerName: 'Step 8: Overall Work Area After Completion',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_09_ont_barcode_scan',
      headerName: 'Step 9: ONT Barcode – Scan barcode + photo of label',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_10_ups_serial_number',
      headerName: 'Step 10: Mini-UPS Serial Number (Gizzu)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_11_powermeter_reading',
      headerName: 'Step 11: Powermeter Reading (Drop/Feeder)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_12_powermeter_at_ont',
      headerName: 'Step 12: Powermeter at ONT (Before Activation)',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_13_active_broadband_light',
      headerName: 'Step 13: Active Broadband Light',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'step_14_customer_signature',
      headerName: 'Step 14: Customer Signature',
      width: 150,
      cellRenderer: CheckboxCellRenderer,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'completed_photos',
      headerName: 'Completed Photos',
      width: 120,
      cellStyle: { 
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#e6f7ff'
      }
    },
    {
      field: 'outstanding_photos',
      headerName: 'X - OUTSTANDING PHOTOS',
      width: 140,
      cellStyle: (params) => ({
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: params.value > 0 ? '#fff2e6' : '#f6ffed',
        color: params.value > 0 ? '#d4380d' : '#52c41a'
      })
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 120,
      pinned: 'right',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'outstanding_photos_loaded_to_1map',
      headerName: 'Outstanding Photos loaded onto 1MAP',
      width: 200,
      cellRenderer: (params: any) => {
        return params.value ? 'Yes' : 'No';
      },
      cellStyle: (params) => ({
        textAlign: 'center',
        color: params.value ? '#52c41a' : '#d4380d',
        fontWeight: 'bold'
      })
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 200,
      editable: true,
      cellEditor: 'agTextCellEditor'
    }
  ];

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: false
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onCellEditingStopped = (event: CellEditingStoppedEvent) => {
    if (event.oldValue !== event.newValue && event.colDef.field === 'comment') {
      updateReview(event.data.id, 'comment', event.newValue);
    }
  };

  // Add global function for checkbox updates
  useEffect(() => {
    (window as any).updateQAReview = (id: string, field: string, value: boolean) => {
      updateReview(id, field, value);
    };
  }, []);

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
    <div className="w-full h-[600px] p-4">
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
          paginationPageSize={50}
          animateRows={true}
          rowSelection={{ mode: 'singleRow' }}
          suppressClickEdit={false}
        />
      </div>
    </div>
  );
}