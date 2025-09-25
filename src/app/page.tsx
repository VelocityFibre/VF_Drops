import QAPhotosGrid from '@/components/QAPhotosGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full">
        <header className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VF Drops - QA Photos Review</h1>
              <p className="text-gray-600 mt-1 text-sm">Velocity Fibre Photo QA Management System - Version 2.0</p>
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <QAPhotosGrid />
        </div>
      </div>
    </div>
  );
}
