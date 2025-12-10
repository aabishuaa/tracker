export type Priority = 'High' | 'Medium' | 'Low';
export type Section = 'Planning' | 'Execution' | 'Discovery' | 'Wrap-up';
export type StatusType = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  taskforce: string[];
  date: string;
  status: StatusType | string;
  priority: Priority;
  section: Section | string;
  lastUpdated: string;
  notes: string;
  progress: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  color: string;
}

export interface CustomStatus {
  id: string;
  name: string;
  color: string;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  name: string;
  actionItems: ActionItem[];
  calendarEvents: CalendarEvent[];
}

export interface ToastMessage {
  id: string;
  message: string;
}
