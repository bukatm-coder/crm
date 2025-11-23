
import React, { useMemo } from 'react';
import { AppData, Student } from '../types';
import { TABLE_COLUMNS } from '../constants';
import { formatMoney, formatPhone, isOverdue } from '../utils/helpers';
import { InputCell } from './ui/InputCell';
import { SelectCell } from './ui/SelectCell';

interface Props {
  data: AppData;
  students: Student[];
  onUpdate: (id: string, field: keyof Student, value: any) => void;
  onAddOption: (type: 'teachers' | 'courses' | 'sources', val: string) => void;
  onDelete: (id: string) => void;
  onAddStudent: () => void;
}

interface GroupStats {
  list: Student[];
  totalPayment: number;
  totalStudents: number;
}

export const CRMTable: React.FC<Props> = ({ data, students, onUpdate, onAddOption, onDelete, onAddStudent }) => {
  
  // Group students by Month Year
  const groupedData = useMemo<Record<string, GroupStats>>(() => {
    const sorted = [...students].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      const valA = isNaN(timeA) ? 0 : timeA;
      const valB = isNaN(timeB) ? 0 : timeB;
      return valA - valB;
    });
    
    const groups: Record<string, GroupStats> = {};
    
    sorted.forEach(student => {
      const d = new Date(student.date);
      const key = isNaN(d.getTime()) ? 'Без даты' : d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
      const niceKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      if (!groups[niceKey]) {
        groups[niceKey] = { list: [], totalPayment: 0, totalStudents: 0 };
      }
      groups[niceKey].list.push(student);
      groups[niceKey].totalPayment += (student.payment || 0);
      groups[niceKey].totalStudents += 1;
    });

    return groups;
  }, [students]);

  const statusColors: Record<string, string> = {
    'В работе': 'bg-blue-100 text-blue-800 border-blue-200',
    'Завершил': 'bg-green-100 text-green-800 border-green-200',
    'Отменил': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm border-t border-gray-200">
      <div className="flex-1 overflow-auto crm-scroll relative">
        <div className="min-w-max">
          
          {/* Header Row */}
          <div className="flex bg-gray-50/80 backdrop-blur sticky top-0 z-10 border-b border-gray-200 shadow-sm">
             <div className="w-10 flex-shrink-0 border-r border-gray-200/50"></div>
            {TABLE_COLUMNS.map((col) => (
              <div 
                key={col.id} 
                className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200/50 flex-shrink-0"
                style={{ width: col.width, minWidth: col.minWidth }}
              >
                {col.label}
              </div>
            ))}
            <div className="w-8"></div>
          </div>

          {/* Groups */}
          {Object.entries(groupedData).map(([groupName, group]: [string, GroupStats]) => (
            <React.Fragment key={groupName}>
              {/* Group Header */}
              <div className="flex items-center bg-[#F9FAFB] py-2 px-4 border-b border-gray-200 mt-2">
                <h3 className="text-sm font-bold text-gray-900">{groupName}</h3>
                <div className="ml-auto flex items-center gap-6 text-xs text-gray-500 font-medium">
                   <span>Учеников: <span className="text-gray-900">{group.totalStudents}</span></span>
                   <span>Итого: <span className="text-gray-900">{formatMoney(group.totalPayment)}</span></span>
                </div>
              </div>

              {/* Rows */}
              {group.list.map((student, idx) => (
                <div key={student.id} className="flex border-b border-gray-100 hover:bg-blue-50/30 group items-center text-sm relative transition-colors">
                  {/* Index */}
                  <div className="w-10 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-400 border-r border-gray-100 h-10 select-none font-mono">
                    {idx + 1}
                  </div>

                  {TABLE_COLUMNS.map((col) => {
                    const isControl = col.id === 'controlDate';
                    const overdue = isControl && isOverdue(student.controlDate) && student.status === 'В работе';

                    return (
                      <div 
                        key={col.id} 
                        className="border-r border-gray-100 flex-shrink-0 h-10 flex items-center relative"
                        style={{ width: col.width, minWidth: col.minWidth }}
                      >
                         <div className="w-full h-full px-2 flex items-center">
                            {col.id === 'date' || col.id === 'controlDate' ? (
                              <InputCell 
                                type="date"
                                value={student[col.id] as string}
                                onChange={(v) => onUpdate(student.id, col.id, v)}
                                warning={overdue}
                              />
                            ) : col.id === 'teacher' ? (
                              <SelectCell 
                                value={student.teacher} 
                                options={data.teachers}
                                onChange={(v) => onUpdate(student.id, 'teacher', v)}
                                onAddOption={(v) => onAddOption('teachers', v)}
                              />
                            ) : col.id === 'course' ? (
                              <SelectCell 
                                value={student.course} 
                                options={data.courses}
                                onChange={(v) => onUpdate(student.id, 'course', v)}
                                onAddOption={(v) => onAddOption('courses', v)}
                              />
                            ) : col.id === 'source' ? (
                              <SelectCell 
                                value={student.source} 
                                options={data.sources}
                                onChange={(v) => onUpdate(student.id, 'source', v)}
                                onAddOption={(v) => onAddOption('sources', v)}
                              />
                            ) : col.id === 'status' ? (
                              <div className="w-full">
                                <select 
                                  className={`w-full py-0.5 px-2 outline-none text-[11px] font-semibold rounded-md appearance-none cursor-pointer border transition-colors ${statusColors[student.status] || ''}`}
                                  value={student.status}
                                  onChange={(e) => onUpdate(student.id, 'status', e.target.value)}
                                >
                                  <option value="В работе">В работе</option>
                                  <option value="Завершил">Завершил</option>
                                  <option value="Отменил">Отменил</option>
                                </select>
                              </div>
                            ) : col.id === 'phone' ? (
                              <InputCell 
                                value={formatPhone(student.phone)}
                                onChange={(v) => onUpdate(student.id, 'phone', v)}
                                placeholder="+7..."
                                type="phone"
                              />
                            ) : col.id === 'payment' || col.id === 'bonus' ? (
                              <InputCell 
                                type="money"
                                value={student[col.id] as number}
                                onChange={(v) => onUpdate(student.id, col.id, v)}
                              />
                            ) : (
                              <InputCell 
                                value={student[col.id as keyof Student] as string}
                                onChange={(v) => onUpdate(student.id, col.id, v)}
                              />
                            )}
                         </div>
                      </div>
                    );
                  })}
                  
                  {/* Delete Button */}
                  <button 
                      onClick={() => { if(window.confirm('Удалить запись?')) onDelete(student.id); }}
                      className="absolute right-1 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Удалить строку"
                    >
                      &times;
                  </button>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Row Button - Always visible at bottom */}
          <div className="p-6 flex justify-center bg-white border-t border-gray-100 mt-2 pb-20">
            <button 
              onClick={onAddStudent}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors py-2 px-6 hover:bg-blue-50 rounded-full border border-blue-100 hover:border-blue-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Добавить строку
            </button>
          </div>

          {students.length === 0 && (
             <div className="p-12 text-center">
               <div className="text-gray-300 mb-2">
                 <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
               </div>
               <p className="text-gray-400 text-sm">Список пуст</p>
               <p className="text-gray-300 text-xs mt-1">Нажмите "Добавить строку" чтобы создать запись</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
