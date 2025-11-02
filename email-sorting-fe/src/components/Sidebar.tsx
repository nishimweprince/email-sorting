import { useState } from 'react';
import { useApp } from '@/contexts/useAppContext';
import { processApi } from '@/utils/api';
import CategoryModal from './CategoryModal';
import AlertModal from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AxiosError } from 'axios';

interface SidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const { categories, refreshCategories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSyncDisclaimer, setShowSyncDisclaimer] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await processApi.syncEmails(50);
      await refreshCategories(); // Refetch categories after successful sync
      setShowSyncDisclaimer(true);
      onSelectCategory(null);
    } catch (error: unknown) {
      setAlertModal({
        open: true,
        title: 'Error',
        message: (error as unknown as AxiosError<{ error?: string }>)?.response?.data?.error || 'Failed to sync emails',
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <aside className="w-[280px] sm:w-[320px] h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg lg:shadow-none">
      <section className="p-3 sm:p-4">
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full bg-primary-400 hover:bg-primary-500 text-sm sm:text-base"
          size="sm"
        >
          {syncing ? 'Syncing...' : 'Sync Emails'}
        </Button>
      </section>

      <nav className="flex-1 flex flex-col overflow-hidden">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer text-left transition-colors border-l-4 text-sm sm:text-base ${
            selectedCategoryId === null
              ? 'bg-primary-50 border-primary-400 font-medium'
              : 'bg-transparent border-transparent hover:bg-gray-50'
          }`}
        >
          All Emails
        </button>

        <header className="px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center border-y border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-xs sm:text-sm text-gray-600 tracking-wide">CATEGORIES</h2>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="text-xs bg-primary-400 hover:bg-primary-500 h-7 sm:h-8"
          >
            + Add
          </Button>
        </header>

        <ul className="flex-1 overflow-y-auto list-none m-0 p-0">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onSelectCategory(category.id)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer flex justify-between items-center transition-colors border-l-4 text-sm sm:text-base ${
                  selectedCategoryId === category.id
                    ? 'bg-primary-50 border-primary-400'
                    : 'bg-transparent border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color || '#9bb4c0' }}
                    aria-label={`Category color for ${category.name}`}
                  />
                  <span className="truncate text-sm sm:text-base">{category.name}</span>
                </div>
                {category._count && (
                  <Badge variant="secondary" className="text-xs bg-secondary-200 shrink-0 ml-2">
                    {category._count.emails}
                  </Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {showModal && (
        <CategoryModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refreshCategories();
          }}
        />
      )}
      <AlertModal
        open={alertModal.open}
        onClose={() => setAlertModal({ ...alertModal, open: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
      <AlertModal
        open={showSyncDisclaimer}
        onClose={() => setShowSyncDisclaimer(false)}
        title="Email Sync in Progress"
        message="Email synchronization has been started. You will be notified when the sync is completed. This may take a few minutes."
        type="info"
      />
    </aside>
  );
}
