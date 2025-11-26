import { create } from 'zustand';
import { User, Memory, Folder, ViewState } from './types';

// --- UTILS ---

const generateId = () => {
  // Fallback for environments where crypto is not available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if it fails
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- MOCK DATABASE (LocalStorage) UTILS ---

const STORAGE_KEYS = {
  USERS: 'mf_users',
  MEMORIES: 'mf_memories',
  FOLDERS: 'mf_folders',
  SESSION: 'mf_session'
};

const getStorage = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- STORE INTERFACE ---

interface AppState {
  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  selectedMemoryId: string | null;
  setSelectedMemoryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterFolderId: string | null; // null = all
  setFilterFolderId: (id: string | null) => void;
  
  // Auth State
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => void;

  // Data State
  memories: Memory[];
  folders: Folder[];
  
  // Data Actions
  fetchData: () => void;
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  addFolder: (name: string, color: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

// --- ZUSTAND STORE ---

export const useStore = create<AppState>((set, get) => ({
  // UI
  darkMode: false,
  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    set({ darkMode: newMode });
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  },
  currentView: 'DASHBOARD',
  setView: (view) => set({ currentView: view }),
  selectedMemoryId: null,
  setSelectedMemoryId: (id) => set({ selectedMemoryId: id }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  filterFolderId: null,
  setFilterFolderId: (id) => set({ filterFolderId: id }),

  // Auth
  user: null,
  restoreSession: () => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      set({ user: JSON.parse(session) });
      get().fetchData();
    }
  },
  login: async (email, password) => {
    // Simulating API latency
    await new Promise(r => setTimeout(r, 500));
    const users = getStorage<User & { password: string }>(STORAGE_KEYS.USERS);
    const validUser = users.find(u => u.email === email && u.password === password); // In real app: bcrypt
    
    if (validUser) {
      const { password, ...safeUser } = validUser;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
      set({ user: safeUser });
      get().fetchData();
      return true;
    }
    return false;
  },
  register: async (name, email, password) => {
    await new Promise(r => setTimeout(r, 500));
    const users = getStorage<User & { password: string }>(STORAGE_KEYS.USERS);
    
    if (users.some(u => u.email === email)) return false; // Exists

    const newUser = { id: generateId(), name, email, password };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    
    // Auto login
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
    set({ user: safeUser });
    get().fetchData();
    return true;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    set({ user: null, memories: [], folders: [] });
  },

  // Data
  memories: [],
  folders: [],

  fetchData: () => {
    const user = get().user;
    if (!user) return;

    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    const allFolders = getStorage<Folder>(STORAGE_KEYS.FOLDERS);

    set({
      memories: allMemories.filter(m => m.userId === user.id),
      folders: allFolders.filter(f => f.userId === user.id)
    });
  },

  addMemory: async (memoryData) => {
    const user = get().user;
    if (!user) return;
    
    const newMemory: Memory = {
      ...memoryData,
      id: generateId(),
      userId: user.id,
      createdAt: Date.now(),
      tags: memoryData.tags || [],
      isFavorite: false,
    };

    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    allMemories.push(newMemory);
    setStorage(STORAGE_KEYS.MEMORIES, allMemories);
    get().fetchData();
  },

  updateMemory: async (id, updates) => {
    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    const index = allMemories.findIndex(m => m.id === id);
    if (index !== -1) {
      allMemories[index] = { ...allMemories[index], ...updates };
      setStorage(STORAGE_KEYS.MEMORIES, allMemories);
      get().fetchData();
    }
  },

  deleteMemory: async (id) => {
    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    const newMemories = allMemories.filter(m => m.id !== id);
    setStorage(STORAGE_KEYS.MEMORIES, newMemories);
    get().fetchData();
  },

  toggleFavorite: async (id) => {
    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    const memory = allMemories.find(m => m.id === id);
    if (memory) {
      memory.isFavorite = !memory.isFavorite;
      setStorage(STORAGE_KEYS.MEMORIES, allMemories);
      get().fetchData();
    }
  },

  addFolder: async (name, color) => {
    const user = get().user;
    if (!user) return;

    const newFolder: Folder = {
      id: generateId(),
      name,
      color,
      userId: user.id,
      createdAt: Date.now()
    };
    
    const allFolders = getStorage<Folder>(STORAGE_KEYS.FOLDERS);
    allFolders.push(newFolder);
    setStorage(STORAGE_KEYS.FOLDERS, allFolders);
    get().fetchData();
  },

  deleteFolder: async (id) => {
    const allFolders = getStorage<Folder>(STORAGE_KEYS.FOLDERS);
    const newFolders = allFolders.filter(f => f.id !== id);
    setStorage(STORAGE_KEYS.FOLDERS, newFolders);
    
    // Unassign memories in this folder
    const allMemories = getStorage<Memory>(STORAGE_KEYS.MEMORIES);
    allMemories.forEach(m => {
      if (m.folderId === id) m.folderId = undefined;
    });
    setStorage(STORAGE_KEYS.MEMORIES, allMemories);
    
    get().fetchData();
  }
}));