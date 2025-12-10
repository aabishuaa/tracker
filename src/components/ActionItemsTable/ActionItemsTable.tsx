import React from 'react';
import type { ActionItem, Priority } from '../../types';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

interface ActionItemsTableProps {
  items: ActionItem[];
  onUpdate: (id: string, updatedItem: ActionItem) => void;
  onAdd: () => void;
}

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'High':
      return '#F56565';
    case 'Medium':
      return '#ED8936';
    case 'Low':
      return '#48BB78';
    default:
      return '#A0AEC0';
  }
};

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({
  items,
  onUpdate,
  onAdd,
}) => {
  const sections = [...new Set(items.map((item) => item.section))];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section}>
                <tr>
                  <td colSpan={7}>
                    <div className="section-header">{section}</div>
                  </td>
                </tr>
                {items
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <TableRow
                      key={item.id}
                      item={item}
                      onUpdate={onUpdate}
                      priorityColor={getPriorityColor(item.priority)}
                    />
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onAdd}
          className="button-hover flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-ey-yellow hover:bg-yellow-50"
        >
          <span className="text-xl">+</span>
          Add Item
        </button>
      </div>
    </div>
  );
};
