
import { AppData, Student } from '../types';
import { INITIAL_DATA, DATA_KEY } from '../constants';
import { generateId } from '../utils/helpers';

class StorageService {
  private isOffline = false;

  private getLocalStorage(): AppData {
    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) {
      return INITIAL_DATA;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local data", e);
      return INITIAL_DATA;
    }
  }

  private saveLocalStorage(data: AppData) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  // --- API Methods ---

  async getData(): Promise<{ data: AppData; isOffline: boolean }> {
    try {
      // Try fetching from server first
      const response = await fetch('/api/data', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2s timeout
      });

      if (!response.ok) throw new Error('Server error');
      
      const serverData = await response.json();
      // Sync server data to local storage for backup
      this.saveLocalStorage(serverData);
      this.isOffline = false;
      return { data: serverData, isOffline: false };

    } catch (error) {
      console.warn("Backend unavailable, using LocalStorage:", error);
      this.isOffline = true;
      return { data: this.getLocalStorage(), isOffline: true };
    }
  }

  async saveData(data: AppData): Promise<boolean> {
    // Always save locally first (optimistic UI)
    this.saveLocalStorage(data);

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.isOffline = false;
        return true;
      } else {
        throw new Error('Server save failed');
      }
    } catch (error) {
      console.warn("Failed to save to server, data saved locally only:", error);
      this.isOffline = true;
      return false; // Indicates offline/fail
    }
  }

  // --- Helper Wrappers ---
  // These modify the data object and then trigger a save

  async addStudent(currentData: AppData, studentPartial: Partial<Student>): Promise<{ data: AppData, newStudent: Student }> {
    const newStudent: Student = {
      id: generateId(),
      date: new Date().toISOString(),
      city: '',
      teacher: '',
      name: '',
      phone: '',
      controlDate: '',
      course: '',
      payment: 0,
      comment: '',
      status: 'В работе',
      bonus: 0,
      source: '',
      ...studentPartial
    };
    
    const newData = {
      ...currentData,
      students: [...currentData.students, newStudent]
    };

    await this.saveData(newData);
    return { data: newData, newStudent };
  }

  async updateStudent(currentData: AppData, id: string, updates: Partial<Student>): Promise<AppData> {
    const index = currentData.students.findIndex(s => s.id === id);
    if (index === -1) return currentData;

    const updatedStudents = [...currentData.students];
    updatedStudents[index] = { ...updatedStudents[index], ...updates };
    
    const newData = { ...currentData, students: updatedStudents };
    await this.saveData(newData);
    return newData;
  }

  async deleteStudent(currentData: AppData, id: string): Promise<AppData> {
    const newData = {
      ...currentData,
      students: currentData.students.filter(s => s.id !== id)
    };
    await this.saveData(newData);
    return newData;
  }

  async addOption(currentData: AppData, type: 'teachers' | 'courses' | 'sources', value: string): Promise<AppData> {
    if (currentData[type].includes(value)) return currentData;

    const newData = {
      ...currentData,
      [type]: [...currentData[type], value]
    };
    await this.saveData(newData);
    return newData;
  }
}

export const storageService = new StorageService();
