export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: number;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string; // ISO string
  folderId?: string; // Optional (Unassigned)
  isFavorite: boolean;
  userId: string;
  tags: string[];
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export type ViewState = 'DASHBOARD' | 'MEMORY_DETAILS' | 'FOLDERS';
