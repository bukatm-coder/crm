import React, { useMemo } from 'react';
import { AppData, Student } from '../types';
import { formatMoney } from '../utils/helpers';

interface Props {
  data: AppData;
  students: Student[]; // Filtered students
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const Dashboard: React.FC<Props> = ({ students }) => {
  const stats = useMemo(() => {
    let totalPayment = 0;
    let totalBonus = 0;
    const sourceCount: Record<string, number> = {};
    const teacherPerformance: Record<string, number> = {};

    students.forEach(s => {
      totalPayment += s.payment || 0;
      totalBonus += s.bonus || 0;
      
      const src = s.source || 'Не указан';
      sourceCount[src] = (sourceCount[src] || 0) + 1;

      const teacher = s.teacher || 'Не указан';
      teacherPerformance[teacher] = (teacherPerformance[teacher] || 0) + (s.payment || 0);
    });

    const sourceData = Object.entries(sourceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

    const teacherData = Object.entries(teacherPerformance)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

    return { totalPayment, totalBonus, totalStudents: students.length, sourceData, teacherData };
  }, [students]);

  // Helper for Pie Chart Slices
  const renderPieSlices = () => {
    const total = stats.totalStudents;
    if (total === 0) return null;

    let cumulativePercent = 0;
    
    return stats.sourceData.map((slice, index) => {
      const percent = slice.value / total;
      const startX = Math.cos(2 * Math.PI * cumulativePercent);
      const startY = Math.sin(2 * Math.PI * cumulativePercent);
      cumulativePercent += percent;
      const endX = Math.cos(2 * Math.PI * cumulativePercent);
      const endY = Math.sin(2 * Math.PI * cumulativePercent);

      const largeArcFlag = percent > 0.5 ? 1 : 0;
      
      const pathData = total === slice.value
        ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0` // Full circle
        : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

      return (
        <path
          key={slice.name}
          d={pathData}
          fill={COLORS[index % COLORS.length]}
          className="hover:opacity-80 transition-opacity"
        >
          <title>{`${slice.name}: ${slice.value} (${Math.round(percent * 100)}%)`}</title>
        </path>
      );
    });
  };

  const maxTeacherRevenue = Math.max(...stats.teacherData.map(d => d.value), 1);

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Аналитика (Дашборд)</h2>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="text-blue-500 text-sm font-semibold uppercase tracking-wider">Общая сумма</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{formatMoney(stats.totalPayment)}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="text-green-500 text-sm font-semibold uppercase tracking-wider">Учеников</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="text-purple-500 text-sm font-semibold uppercase tracking-wider">Бонусы</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{formatMoney(stats.totalBonus)}</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pie Chart Replacement */}
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-500 mb-4 self-start">Источники (количество)</h3>
          <div className="flex flex-row items-center w-full justify-around">
            <div className="w-32 h-32 relative">
              <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                 {renderPieSlices()}
                 {stats.totalStudents === 0 && <circle cx="0" cy="0" r="1" fill="#E5E7EB" />}
              </svg>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {stats.sourceData.slice(0, 5).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                  <span className="font-medium text-gray-700">{d.name}</span>
                  <span className="text-gray-500">({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart Replacement */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-500 mb-4">Топ преподавателей (по выручке)</h3>
          <div className="flex flex-col gap-3">
             {stats.teacherData.slice(0, 5).map((d, i) => (
               <div key={d.name} className="w-full">
                 <div className="flex justify-between text-xs mb-1">
                   <span className="font-medium text-gray-700 truncate w-24">{d.name}</span>
                   <span className="text-gray-500 font-mono">{formatMoney(d.value)}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                   <div 
                     className="h-2.5 rounded-full" 
                     style={{ 
                       width: `${(d.value / maxTeacherRevenue) * 100}%`,
                       backgroundColor: COLORS[i % COLORS.length]
                     }}
                   ></div>
                 </div>
               </div>
             ))}
             {stats.teacherData.length === 0 && <div className="text-gray-400 text-sm text-center py-8">Нет данных</div>}
          </div>
        </div>

      </div>
    </div>
  );
};