import type { ActionItem } from '../types';

export const exportToCSV = (actionItems: ActionItem[]): void => {
  const headers = [
    'Task Name',
    'Owner',
    'Taskforce',
    'Date',
    'Status',
    'Priority',
    'Section',
    'Progress',
    'Notes',
  ];

  const rows = actionItems.map(item => [
    item.description,
    item.owner,
    Array.isArray(item.taskforce) ? item.taskforce.join('; ') : item.taskforce,
    item.date,
    item.status,
    item.priority,
    item.section,
    `${item.progress}%`,
    item.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const today = new Date().toISOString().split('T')[0];
  link.download = `EY-AI-Taskforce-${today}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
