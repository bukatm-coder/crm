
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, FilterState, Student } from './types';
import { INITIAL_DATA, PASSWORD_KEY } from './constants';
import { storageService } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { CRMTable } from './components/CRMTable';
import { exportToCSV } from './utils/helpers';

// Icons
const IconSearch = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconCloudDownload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const IconCloudUpload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconTable = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-4h14M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>;
const IconChart = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isOffline, setIsOffline] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    paymentStatus: 'all',
    status: 'В работе'
  });
  
  const [activeTab, setActiveTab] = useState<'table' | 'dashboard'>('table');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [notification, setNotification] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(PASSWORD_KEY);
      if (token === 'secret') setIsAuthenticated(true);
      setLoading(false);
    };
    checkAuth();
    loadData();
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin') {
      localStorage.setItem(PASSWORD_KEY, 'secret');
      setIsAuthenticated(true);
    } else {
      alert('Неверный пароль (попробуйте "admin")');
    }
  };

  const loadData = async () => {
    const result = await storageService.getData();
    setData(result.data);
    setIsOffline(result.isOffline);
  };

  const handleSyncFromServer = async () => {
    if(!window.confirm("Вы уверены? Текущие данные на экране будут заменены данными с сервера.")) return;
    
    setIsLoadingFromServer(true);
    try {
      const result = await storageService.getData();
      setData(result.data);
      setIsOffline(result.isOffline);
      if (result.isOffline) {
        showNotification('Сервер недоступен. Загружены локальные данные.', 'error');
      } else {
        showNotification('Данные успешно загружены с сервера', 'success');
      }
    } catch (e) {
      showNotification('Ошибка загрузки', 'error');
    } finally {
      setIsLoadingFromServer(false);
    }
  };

  const handleSaveToServer = async () => {
    setIsSaving(true);
    const success = await storageService.saveData(data);
    setIsOffline(!success);
    if (success) {
      showNotification('Все изменения сохранены на сервере', 'success');
    } else {
      showNotification('Ошибка соединения. Сохранено локально.', 'error');
    }
    setIsSaving(false);
  };

  const showNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Actions ---
  const handleAddStudent = async () => {
    const { data: newData } = await storageService.addStudent(data, {
      date: new Date().toISOString(),
    });
    setData(newData);
  };

  const handleUpdateStudent = async (id: string, field: keyof Student, value: any) => {
    const prevData = data;
    const newData = {
       ...data,
       students: data.students.map(s => s.id === id ? { ...s, [field]: value } : s)
    };
    setData(newData);
    await storageService.updateStudent(prevData, id, { [field]: value });
  };

  const handleAddOption = async (type: 'teachers' | 'courses' | 'sources', val: string) => {
    const newData = await storageService.addOption(data, type, val);
    setData(newData);
  };

  const handleDelete = async (id: string) => {
    const newData = await storageService.deleteStudent(data, id);
    setData(newData);
  };

  // --- Filtering ---
  const filteredStudents = useMemo(() => {
    return data.students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(filters.search.toLowerCase()) || 
        s.phone.includes(filters.search) || 
        s.comment?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchCity = !filters.city || s.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchStatus = filters.status === 'all' || s.status === filters.status;
      return matchSearch && matchCity && matchStatus;
    });
  }, [data.students, filters]);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400">Загрузка...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F3F4F6] p-4 font-sans">
        <form onSubmit={login} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold text-gray-900">TutorCRM</h1>
             <p className="text-sm text-gray-500 mt-1">Вход в систему</p>
          </div>
          <input 
            type="password" 
            placeholder="Пароль" 
            className="w-full border border-gray-200 p-3 rounded-lg mb-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 transition-all"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm">
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[#111827]">
      
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in-down flex items-center gap-2 ${notification.type === 'success' ? 'bg-gray-800 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.text}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-4 py-2 border-b border-gray-200 bg-white z-20">
        <div className="flex items-center justify-between w-full md:w-auto gap-6 mb-2 md:mb-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TutorCRM</h1>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Pro</span>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <IconTable /> Таблица
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <IconChart /> Дашборд
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* Search */}
           <div className="relative flex-1 md:flex-none md:w-64 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <IconSearch />
             </div>
             <input 
               type="text" 
               className="w-full bg-gray-100 hover:bg-gray-50 focus:bg-white border-transparent focus:border-blue-500 border rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none transition-all placeholder-gray-400" 
               placeholder="Поиск..."
               value={filters.search}
               onChange={e => setFilters(f => ({...f, search: e.target.value}))}
             />
           </div>

           <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

           {/* Server Controls */}
           <div className="flex items-center gap-2">
             <button 
                onClick={handleSyncFromServer}
                disabled={isLoadingFromServer}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative group"
                title="Загрузить с сервера"
             >
                <div className={isLoadingFromServer ? 'animate-spin' : ''}>
                  <IconCloudDownload />
                </div>
                {/* Tooltip */}
                <span className="absolute top-full right-0 mt-1 whitespace-nowrap bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Загрузить
                </span>
             </button>

             <button 
                onClick={handleSaveToServer}
                disabled={isSaving}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative group"
                title="Сохранить на сервер"
             >
               <div className={isSaving ? 'animate-pulse' : ''}>
                  <IconCloudUpload /> 
               </div>
               <span className="absolute top-full right-0 mt-1 whitespace-nowrap bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Сохранить
                </span>
             </button>

              <button 
                onClick={() => exportToCSV(filteredStudents)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Скачать CSV"
             >
                <IconDownload />
             </button>
           </div>
           
           {/* Avatar */}
           <div className="hidden md:block ml-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-sm border border-white"></div>
           </div>
        </div>
      </header>

      {/* Filters Bar */}
      {activeTab === 'table' && (
        <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Фильтры:</span>
          
          <div className="flex items-center gap-2">
            {['СПБ', 'МСК'].map(city => (
              <button
                key={city}
                onClick={() => setFilters(f => ({...f, city: f.city === city ? '' : city}))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filters.city === city 
                    ? 'bg-gray-800 text-white border-gray-800 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200 shrink-0"></div>

          <div className="flex items-center gap-2">
             {['В работе', 'Завершил', 'Отменил', 'all'].map(status => {
                const label = status === 'all' ? 'Все статусы' : status;
                const isActive = filters.status === status || (status === 'all' && filters.status === 'all');
                return (
                  <button
                    key={status}
                    onClick={() => setFilters(f => ({...f, status: status as any}))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                        : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                )
             })}
          </div>
          
          {isOffline && (
             <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               Оффлайн режим
             </div>
          )}
        </div>
      )}

      {/* Main Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'table' ? (
          <div className="absolute inset-0 bg-[#F9FAFB]">
             <CRMTable 
              data={data}
              students={filteredStudents}
              onUpdate={handleUpdateStudent}
              onAddOption={handleAddOption}
              onDelete={handleDelete}
              onAddStudent={handleAddStudent}
            />
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto p-6 bg-[#F3F4F6]">
            <Dashboard data={data} students={filteredStudents} />
          </div>
        )}
      </main>
    </div>
  );
}
