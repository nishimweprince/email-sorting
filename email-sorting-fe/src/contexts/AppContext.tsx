import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Category } from '../types';
import { authApi, categoriesApi } from '../utils/api';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  selectedEmails: string[];
  selectEmail: (id: string) => void;
  deselectEmail: (id: string) => void;
  selectAllEmails: (ids: string[]) => void;
  deselectAllEmails: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      await loadCategories();
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  const selectEmail = (id: string) => {
    if (!selectedEmails.includes(id)) {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const deselectEmail = (id: string) => {
    setSelectedEmails(selectedEmails.filter((emailId) => emailId !== id));
  };

  const selectAllEmails = (ids: string[]) => {
    setSelectedEmails(ids);
  };

  const deselectAllEmails = () => {
    setSelectedEmails([]);
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setCategories([]);
      setSelectedEmails([]);
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  };

  const value: AppContextType = {
    user,
    setUser,
    categories,
    setCategories,
    selectedEmails,
    selectEmail,
    deselectEmail,
    selectAllEmails,
    deselectAllEmails,
    isLoading,
    setIsLoading,
    error,
    setError,
    logout,
    refreshCategories,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
