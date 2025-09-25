import InstallationsGrid from '@/components/InstallationsGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">VF Drops - Installation Management</h1>
          <p className="text-gray-600 mt-2">Velocity Fibre Home Install Capture Checklist - Version 1.0</p>
        </header>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <InstallationsGrid />
        </div>
      </div>
    </div>
  );
}
