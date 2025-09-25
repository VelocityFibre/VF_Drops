'use client';

import { useState } from 'react';
import InstallationsGrid from '@/components/InstallationsGrid';
import QAPhotosGrid from '@/components/QAPhotosGrid';

type ViewMode = 'installations' | 'qa-photos';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('installations');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VF Drops - Installation Management</h1>
              <p className="text-gray-600 mt-2">Velocity Fibre Home Install Capture Checklist - Version 1.0</p>
            </div>
            
            {/* Navigation tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('installations')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'installations' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Installations Grid
              </button>
              <button 
                onClick={() => setViewMode('qa-photos')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'qa-photos' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                QA Photos Review
              </button>
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-lg shadow-sm border">
          {viewMode === 'installations' ? (
            <InstallationsGrid />
          ) : (
            <QAPhotosGrid />
          )}
        </div>
      </div>
    </div>
  );
}
