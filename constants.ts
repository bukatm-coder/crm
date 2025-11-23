import { AppData, ColumnConfig } from './types';

export const INITIAL_DATA: AppData = {
  students: [],
  teachers: ['Анна Иванова', 'Петр Петров'],
  courses: ['Английский A1', 'Математика ЕГЭ'],
  sources: ['Avito', 'VK', 'Сайт', 'WhatsApp', 'Партнёр', 'Друзья']
};

export const TABLE_COLUMNS: ColumnConfig[] = [
  { id: 'date', label: 'Дата', width: '100px', minWidth: 100 },
  { id: 'city', label: 'Город', width: '120px', minWidth: 100 },
  { id: 'teacher', label: 'Преподаватель', width: '180px', minWidth: 150 },
  { id: 'name', label: 'Ученик', width: '200px', minWidth: 150 },
  { id: 'phone', label: 'Телефон', width: '160px', minWidth: 140 },
  { id: 'controlDate', label: 'Контроль', width: '100px', minWidth: 100 },
  { id: 'course', label: 'Курс', width: '160px', minWidth: 130 },
  { id: 'payment', label: 'Оплата', width: '100px', minWidth: 90 },
  { id: 'status', label: 'Статус', width: '130px', minWidth: 120 },
  { id: 'bonus', label: 'Бонус', width: '90px', minWidth: 80 },
  { id: 'source', label: 'Источник', width: '120px', minWidth: 100 },
  { id: 'comment', label: 'Комментарий', width: '250px', minWidth: 200 },
];

export const PASSWORD_KEY = "crm_auth_token";
export const DATA_KEY = "crm_data_v1";
