'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowClickedEvent, ModuleRegistry, AllCommunityModule, themeAlpine } from 'ag-grid-community';
import { useEffect, useState, useCallback, useMemo } from 'react';
import FilterPanel, { FilterState } from './FilterPanel';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface Installation {
  id: number;
  drop_number: string;
  contractor_name: string;
  customer_name: string;
  address: string;
  project_name?: string;
  assigned_agent: 'Unallocated' | 'Zander' | 'Michael';
  status: 'submitted' | 'under_review' | 'complete' | 'incomplete' | 'unpaid';
  completion_percentage: number;
  date_submitted: string;
  date_reviewed?: string;
  reviewed_by?: string;
  agent_notes?: string;
}

export default function InstallationsGrid() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});

  // Build query string from filters
  const buildQueryString = useCallback((filterState: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(filterState).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        // Map frontend filter names to API parameter names
        let apiKey = key;
        if (key === 'dropNumber') apiKey = 'drop_number';
        if (key === 'assignedAgent') apiKey = 'assigned_agent';
        params.append(apiKey, value.toString());
      }
    });
    return params.toString();
  }, []);

  const fetchInstallations = useCallback(async (filterState: FilterState = {}) => {
    try {
      setLoading(true);
      const queryString = buildQueryString(filterState);
      const url = `/api/installations${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setInstallations(data);
    } catch (error) {
      console.error('Error fetching installations:', error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchInstallations(filters);
  }, [fetchInstallations, filters]);

  const columnDefs: ColDef[] = [
    {
      field: 'drop_number',
      headerName: 'Drop Number',
      width: 120,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'project_name',
      headerName: 'Project',
      width: 100,
      filter: true,
      cellRenderer: (params: { value: string }) => {
        const project = params.value || 'Unknown';
        const projectColors: { [key: string]: string } = {
          'Lawley': 'bg-blue-100 text-blue-800',
          'Velo Test': 'bg-green-100 text-green-800',
          'Unknown': 'bg-gray-100 text-gray-800'
        };
        
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${projectColors[project] || 'bg-gray-100 text-gray-800'}">${project}</span>`;
      }
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 120,
      filter: true,
      cellStyle: { fontWeight: 'bold', color: '#1f2937' }
    },
    {
      field: 'assigned_agent',
      headerName: 'Assigned Agent',
      width: 140,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Unallocated', 'Zander', 'Michael']
      },
      onCellValueChanged: async (params) => {
        if (params.newValue !== params.oldValue) {
          try {
            const response = await fetch('/api/installations', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: params.data.id,
                assigned_agent: params.newValue
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to update assigned agent');
            }
            
            console.log('Assigned agent updated successfully');
          } catch (error) {
            console.error('Error updating assigned agent:', error);
            // Revert the change on error
            params.node?.setDataValue('assigned_agent', params.oldValue);
          }
        }
      },
      cellRenderer: (params: { value: string }) => {
        const agent = params.value || 'Unallocated';
        const agentColors: { [key: string]: string } = {
          'Unallocated': 'bg-gray-100 text-gray-800',
          'Zander': 'bg-blue-100 text-blue-800',
          'Michael': 'bg-green-100 text-green-800'
        };
        
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${agentColors[agent]}">${agent}</span>`;
      }
    },
    {
      field: 'contractor_name',
      headerName: 'Contractor',
      width: 150,
      filter: true
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 150
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 250,
      filter: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      filter: true,
      cellRenderer: (params: { value: string }) => {
        const status = params.value;
        const statusColors: { [key: string]: string } = {
          submitted: 'bg-blue-100 text-blue-800',
          under_review: 'bg-yellow-100 text-yellow-800',
          complete: 'bg-green-100 text-green-800',
          incomplete: 'bg-red-100 text-red-800',
          unpaid: 'bg-red-100 text-red-800'
        };
        
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}">${status.replace('_', ' ').toUpperCase()}</span>`;
      }
    },
    {
      field: 'completion_percentage',
      headerName: 'Progress',
      width: 100,
      cellRenderer: (params: { value: number }) => {
        const percentage = params.value || 0;
        const color = percentage === 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-blue-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
        
        return `
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div class="${color} h-4 rounded-full flex items-center justify-center text-xs text-white font-medium" style="width: ${percentage}%">
              ${percentage > 20 ? percentage + '%' : ''}
            </div>
          </div>
        `;
      }
    },
    {
      field: 'date_submitted',
      headerName: 'Date Submitted',
      width: 140,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
      filter: 'agDateColumnFilter'
    },
    {
      field: 'reviewed_by',
      headerName: 'Reviewed By',
      width: 120,
      filter: true
    },
    {
      field: 'date_reviewed',
      headerName: 'Date Reviewed',
      width: 140,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '';
      }
    },
    {
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: { data: Installation }) => {
        return `
          <div class="flex gap-1">
            <button class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600" onclick="window.viewInstallation('${params.data.id}')">
              View
            </button>
            <button class="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600" onclick="window.editInstallation('${params.data.id}')">
              Edit
            </button>
          </div>
        `;
      },
      pinned: 'right'
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

  const onRowClicked = (event: RowClickedEvent) => {
    // Navigate to detailed view
    window.location.href = `/installation/${event.data.id}`;
  };

  // Extract unique options for filter dropdowns
  const filterOptions = useMemo(() => {
    const contractorOptions = [...new Set(installations.map(i => i.contractor_name))].filter(Boolean).sort();
    const statusOptions = ['submitted', 'under_review', 'complete', 'incomplete', 'unpaid'];
    const reviewedByOptions = [...new Set(installations.map(i => i.reviewed_by))].filter((option): option is string => Boolean(option)).sort();
    const projectOptions = [...new Set(installations.map(i => i.project_name))].filter((option): option is string => Boolean(option)).sort();
    const assignedAgentOptions = ['Unallocated', 'Zander', 'Michael'];

    return {
      contractorOptions,
      statusOptions,
      reviewedByOptions,
      projectOptions,
      assignedAgentOptions
    };
  }, [installations]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Add global functions for action buttons
  useEffect(() => {
    (window as unknown as { viewInstallation: (id: string) => void }).viewInstallation = (id: string) => {
      window.location.href = `/installation/${id}`;
    };
    
    (window as unknown as { editInstallation: (id: string) => void }).editInstallation = (id: string) => {
      // For now, just navigate to view - we can add edit modal later
      window.location.href = `/installation/${id}`;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        contractorOptions={filterOptions.contractorOptions}
        statusOptions={filterOptions.statusOptions}
        reviewedByOptions={filterOptions.reviewedByOptions}
        projectOptions={filterOptions.projectOptions}
        assignedAgentOptions={filterOptions.assignedAgentOptions}
      />
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <h2 className="text-xl font-semibold">Installations ({installations.length})</h2>
          <div className="flex gap-2">
            <span className="text-sm text-gray-600">
              Submitted: {installations.filter(i => i.status === 'submitted').length}
            </span>
            <span className="text-sm text-gray-600">
              Under Review: {installations.filter(i => i.status === 'under_review').length}
            </span>
            <span className="text-sm text-gray-600">
              Complete: {installations.filter(i => i.status === 'complete').length}
            </span>
            <span className="text-sm text-red-600">
              Unpaid: {installations.filter(i => i.status === 'unpaid').length}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => fetchInstallations(filters)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <div className="w-full h-[600px]">
        <AgGridReact
          theme={themeAlpine}
          rowData={installations}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
          rowSelection={{ mode: 'singleRow' }}
        />
      </div>
    </div>
  );
}