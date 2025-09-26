'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FilterState {
  dropNumber?: string;
  contractor?: string;
  customer?: string;
  project?: string;
  assignedAgent?: string;
  status?: string;
  dateSubmittedFrom?: string;
  dateSubmittedTo?: string;
  dateReviewedFrom?: string;
  dateReviewedTo?: string;
  reviewedBy?: string;
  address?: string;
  completionPercentageMin?: number;
  completionPercentageMax?: number;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  contractorOptions: string[];
  statusOptions: string[];
  reviewedByOptions: string[];
  projectOptions: string[];
  assignedAgentOptions: string[];
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  contractorOptions,
  statusOptions,
  reviewedByOptions,
  projectOptions,
  assignedAgentOptions
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    const count = Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      {/* Filter Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded"
            >
              Clear All
            </button>
          )}
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Drop Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Drop Number
              </label>
              <input
                type="text"
                value={filters.dropNumber || ''}
                onChange={(e) => handleFilterChange('dropNumber', e.target.value)}
                placeholder="e.g. DR001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={filters.project || ''}
                onChange={(e) => handleFilterChange('project', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projectOptions.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Assigned Agent */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assigned Agent
              </label>
              <select
                value={filters.assignedAgent || ''}
                onChange={(e) => handleFilterChange('assignedAgent', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Agents</option>
                {assignedAgentOptions.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Contractor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contractor
              </label>
              <select
                value={filters.contractor || ''}
                onChange={(e) => handleFilterChange('contractor', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Contractors</option>
                {contractorOptions.map(contractor => (
                  <option key={contractor} value={contractor}>{contractor}</option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={filters.customer || ''}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                placeholder="Customer name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={filters.address || ''}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                placeholder="Address search"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Reviewed By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reviewed By
              </label>
              <select
                value={filters.reviewedBy || ''}
                onChange={(e) => handleFilterChange('reviewedBy', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Reviewers</option>
                {reviewedByOptions.map(reviewer => (
                  <option key={reviewer} value={reviewer}>{reviewer}</option>
                ))}
              </select>
            </div>

            {/* Completion Percentage Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Completion %
              </label>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.completionPercentageMin || ''}
                  onChange={(e) => handleFilterChange('completionPercentageMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Min"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.completionPercentageMax || ''}
                  onChange={(e) => handleFilterChange('completionPercentageMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Max"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Submitted Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Submitted
              </label>
              <div className="space-y-1">
                <input
                  type="date"
                  value={filters.dateSubmittedFrom || ''}
                  onChange={(e) => handleFilterChange('dateSubmittedFrom', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateSubmittedTo || ''}
                  onChange={(e) => handleFilterChange('dateSubmittedTo', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Reviewed Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Reviewed
              </label>
              <div className="space-y-1">
                <input
                  type="date"
                  value={filters.dateReviewedFrom || ''}
                  onChange={(e) => handleFilterChange('dateReviewedFrom', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateReviewedTo || ''}
                  onChange={(e) => handleFilterChange('dateReviewedTo', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}