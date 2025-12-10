import React, { useState } from 'react';
import type { ActionItem } from '../../types';
import { getInitials, getAvatarColor } from '../../utils/dateUtils';

interface TableRowProps {
  item: ActionItem;
  onUpdate: (id: string, updatedItem: ActionItem) => void;
  priorityColor: string;
}

const EditableCell: React.FC<{
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}> = ({ value, onChange, type = 'text', className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`editable-cell editing ${className} w-full border-0`}
      />
    );
  }

  return (
    <div className={`editable-cell ${className}`} onClick={() => setIsEditing(true)}>
      {value || <span className="text-gray-400">+ Add</span>}
    </div>
  );
};

const StatusPill: React.FC<{
  status: string;
  onChange: (value: string) => void;
}> = ({ status, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-status-done';
      case 'In Progress':
        return 'bg-status-in-progress';
      case 'Blocked':
        return 'bg-status-blocked';
      case 'Not Started':
        return 'bg-status-not-started';
      default:
        return 'bg-gray-500';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <select
        value={status}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="status-pill border-0 cursor-pointer"
      >
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Blocked">Blocked</option>
        <option value="Done">Done</option>
      </select>
    );
  }

  return (
    <span
      className={`status-pill ${getStatusColor(status)} cursor-pointer`}
      onClick={() => setIsEditing(true)}
    >
      {status}
    </span>
  );
};

const ProgressBar: React.FC<{ progress: number; status: string }> = ({
  progress,
  status,
}) => {
  const getColor = () => {
    switch (status) {
      case 'Done':
        return 'bg-status-done';
      case 'In Progress':
        return 'bg-status-in-progress';
      case 'Blocked':
        return 'bg-status-blocked';
      default:
        return 'bg-status-not-started';
    }
  };

  return (
    <div className="w-full">
      <div className="progress-bar">
        <div className={`progress-fill ${getColor()}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{progress}%</div>
    </div>
  );
};

const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <div
    className="avatar"
    style={{ backgroundColor: getAvatarColor(name) }}
  >
    {getInitials(name)}
  </div>
);

export const TableRow: React.FC<TableRowProps> = ({
  item,
  onUpdate,
  priorityColor,
}) => {
  const handleUpdate = (field: keyof ActionItem, value: any) => {
    onUpdate(item.id, {
      ...item,
      [field]: value,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <tr className="table-row" style={{ borderLeft: `4px solid ${priorityColor}` }}>
      <td className="px-4 py-3">
        <EditableCell
          value={item.description}
          onChange={(val) => handleUpdate('description', val)}
          className="font-medium text-gray-800"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <Avatar name={item.owner} />
          <EditableCell
            value={item.owner}
            onChange={(val) => handleUpdate('owner', val)}
            className="ml-2"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="avatar-group">
          {item.taskforce.slice(0, 3).map((person, idx) => (
            <Avatar key={idx} name={person} />
          ))}
          {item.taskforce.length > 3 && (
            <span className="text-xs text-gray-500 ml-2">
              +{item.taskforce.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <EditableCell
          value={item.date}
          onChange={(val) => handleUpdate('date', val)}
          type="date"
        />
      </td>
      <td className="px-4 py-3">
        <StatusPill status={item.status} onChange={(val) => handleUpdate('status', val)} />
      </td>
      <td className="px-4 py-3">
        <ProgressBar progress={item.progress} status={item.status} />
      </td>
      <td className="px-4 py-3">
        <EditableCell
          value={item.notes}
          onChange={(val) => handleUpdate('notes', val)}
          className="text-sm text-gray-600"
        />
      </td>
    </tr>
  );
};
