export type Status = 'В работе' | 'Завершил' | 'Отменил';

export interface Student {
  id: string;
  date: string; // ISO String for internal storage, displayed as DD.MM.YY
  city: string;
  teacher: string;
  name: string; // Student Name
  phone: string;
  controlDate: string; // ISO String
  course: string;
  payment: number;
  comment: string;
  status: Status;
  bonus: number;
  source: string;
}

export interface FilterState {
  search: string;
  city: string;
  paymentStatus: 'all' | 'paid' | 'unpaid';
  status: Status | 'all';
}

export interface AppData {
  students: Student[];
  teachers: string[];
  courses: string[];
  sources: string[];
}

// Columns configuration for dynamic rendering
export interface ColumnConfig {
  id: keyof Student;
  label: string;
  width: string;
  minWidth: number;
}