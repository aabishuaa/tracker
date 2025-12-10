import React from 'react';

interface HeaderProps {
  onSaveSnapshot: () => void;
  onExportCSV: () => void;
  onViewHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSaveSnapshot,
  onExportCSV,
  onViewHistory,
}) => {
  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-16 bg-ey-yellow rounded-full"></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                EY AI Taskforce
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Action Items & Initiative Tracker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSaveSnapshot}
              className="button-hover px-4 py-2 bg-gray-800 text-white rounded-lg font-medium"
            >
              Save Snapshot
            </button>
            <button
              onClick={onExportCSV}
              className="button-hover px-4 py-2 bg-ey-yellow text-gray-900 rounded-lg font-bold"
            >
              Export CSV
            </button>
            <button
              onClick={onViewHistory}
              className="button-hover px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
