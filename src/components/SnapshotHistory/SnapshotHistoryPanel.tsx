import React from 'react';
import type { Snapshot } from '../../types';
import { getRelativeTime } from '../../utils/dateUtils';

interface SnapshotHistoryPanelProps {
  snapshots: Snapshot[];
  onView: (snapshot: Snapshot) => void;
  onClose: () => void;
}

export const SnapshotHistoryPanel: React.FC<SnapshotHistoryPanelProps> = ({
  snapshots,
  onView,
  onClose,
}) => {
  return (
    <div className="bg-white border-b-2 border-gray-200 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Saved Snapshots</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 text-3xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {snapshots.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">
            No snapshots saved yet
          </div>
        ) : (
          snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="snapshot-card"
              onClick={() => onView(snapshot)}
            >
              <h3 className="font-bold text-gray-800 mb-2 truncate">
                {snapshot.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {getRelativeTime(snapshot.timestamp)}
              </p>
              <p className="text-sm text-gray-500">
                {snapshot.actionItems.length} items •{' '}
                {snapshot.calendarEvents.length} events
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
