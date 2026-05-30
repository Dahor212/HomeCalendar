export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string | null;
  all_day: boolean;
  color: string;
  creator_id: number;
  shared: boolean;
  reminder_minutes: number;
  created_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  start: string;
  end?: string;
  all_day?: boolean;
  color?: string;
  shared?: boolean;
  reminder_minutes?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  priority: "low" | "medium" | "high";
  creator_id: number;
  assigned_to: number | null;
  shared: boolean;
  reminder_minutes: number;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  assigned_to?: number;
  shared?: boolean;
  reminder_minutes?: number;
}
