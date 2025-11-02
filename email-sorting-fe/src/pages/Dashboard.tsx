import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import { Button } from '@/components/ui/button';
import type { Email } from '@/types';

export default function Dashboard() {
  const { user, logout } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent truncate">
            AI Email Sorting
          </h1>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-gray-600 truncate max-w-[200px]">{user?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="shrink-0"
            >
              Logout
            </Button>
          </div>
        </header>

        <section className="flex-1 flex overflow-hidden min-w-0">
          <div className={`min-w-0 overflow-hidden flex flex-col ${selectedEmail ? 'flex-[0_1_auto] max-w-[50%]' : 'flex-1'}`}>
            <EmailList
              categoryId={selectedCategoryId}
              onSelectEmail={setSelectedEmail}
              selectedEmailId={selectedEmail?.id}
            />
          </div>
          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
