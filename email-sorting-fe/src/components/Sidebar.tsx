import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { processApi } from '@/utils/api';
import CategoryModal from './CategoryModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const { categories, refreshCategories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await processApi.syncEmails(50);
      alert('Emails synced successfully!');
      onSelectCategory(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <section className="p-4">
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full bg-primary-400 hover:bg-primary-500"
        >
          {syncing ? 'Syncing...' : 'Sync Emails'}
        </Button>
      </section>

      <nav className="flex-1 flex flex-col overflow-hidden">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-3 cursor-pointer text-left transition-colors border-l-4 ${
            selectedCategoryId === null
              ? 'bg-primary-50 border-primary-400 font-medium'
              : 'bg-transparent border-transparent hover:bg-gray-50'
          }`}
        >
          All Emails
        </button>

        <header className="px-4 py-3 flex justify-between items-center border-y border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-sm text-gray-600 tracking-wide">CATEGORIES</h2>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="text-xs bg-primary-400 hover:bg-primary-500"
          >
            + Add
          </Button>
        </header>

        <ul className="flex-1 overflow-y-auto list-none m-0 p-0">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onSelectCategory(category.id)}
                className={`w-full px-4 py-3 cursor-pointer flex justify-between items-center transition-colors border-l-4 ${
                  selectedCategoryId === category.id
                    ? 'bg-primary-50 border-primary-400'
                    : 'bg-transparent border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color || '#9bb4c0' }}
                    aria-label={`Category color for ${category.name}`}
                  />
                  <span className="truncate">{category.name}</span>
                </div>
                {category._count && (
                  <Badge variant="secondary" className="text-xs bg-secondary-200">
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
    </aside>
  );
}
