export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string | null;
  all_day: boolean;
  color: string;
  category_id: number | null;
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
  category_id?: number;
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
  category_id: number | null;
  creator_id: number;
  shared: boolean;
  reminder_minutes: number;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  category_id?: number;
  shared?: boolean;
  reminder_minutes?: number;
}
