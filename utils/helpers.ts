import { Student, Status } from '../types';

// Date Helpers
export const formatDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}.${m}.${y}`;
};

export const parseDateInput = (input: string): string => {
  // Try to parse DD.MM.YY or DD.MM.YYYY to ISO
  const parts = input.split('.');
  if (parts.length === 3) {
    let year = parseInt(parts[2]);
    if (year < 100) year += 2000;
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[0]);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return input; // Return original if parse fails, though UI handles this
};

export const isOverdue = (dateString: string): boolean => {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - target.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays > 1; // Overdue by more than 24 hours (1 day)
};

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
};

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  // Mask: +7 (000) 000 00 00
  // Standardize to 7XXXXXXXXXX
  let clean = numbers;
  if (numbers.length > 0 && ['7', '8'].includes(numbers[0])) {
     clean = numbers.substring(1);
  }
  clean = clean.substring(0, 10);
  
  const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
  if (!match) return value;
  
  let formatted = '+7';
  if (match[1]) formatted += ` (${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += ` ${match[3]}`;
  if (match[4]) formatted += ` ${match[4]}`;
  return formatted;
};

// CSV Export
export const exportToCSV = (data: Student[]) => {
  const headers = ['ID', 'Дата', 'Город', 'Преподаватель', 'Ученик', 'Телефон', 'Контроль', 'Курс', 'Оплата', 'Статус', 'Бонус', 'Источник', 'Комментарий'];
  const rows = data.map(s => [
    s.id,
    formatDate(s.date),
    s.city,
    s.teacher,
    s.name,
    s.phone,
    formatDate(s.controlDate),
    s.course,
    s.payment,
    s.status,
    s.bonus,
    s.source,
    `"${s.comment?.replace(/"/g, '""')}"` // Escape quotes
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `crm_backup_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// JSON Export
export const exportToJSON = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `data_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Basic ID Generator
export const generateId = () => Math.random().toString(36).substr(2, 9);
