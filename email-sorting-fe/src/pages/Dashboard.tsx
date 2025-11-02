import { useState } from 'react';
import { useApp } from '@/contexts/useAppContext';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import { Button } from '@/components/ui/button';
import type { Email } from '@/types';

export default function Dashboard() {
  const { user, logout } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setSidebarOpen(false);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-primary-500 truncate">
              AI Email Sorting
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="hidden sm:inline text-gray-600 truncate max-w-[120px] sm:max-w-[200px]">{user?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="shrink-0 text-xs sm:text-sm"
            >
              Logout
            </Button>
          </div>
        </header>

        <section className="flex-1 flex overflow-hidden min-w-0">
          {/* Email List - Hidden on mobile when email detail is shown */}
          <div className={`
            min-w-0 overflow-hidden flex flex-col
            ${selectedEmail ? 'hidden md:flex md:flex-[0_1_auto] md:max-w-[50%]' : 'flex-1'}
          `}>
            <EmailList
              categoryId={selectedCategoryId}
              onSelectEmail={setSelectedEmail}
              selectedEmailId={selectedEmail?.id}
            />
          </div>

          {/* Email Detail - Full width on mobile, side panel on desktop */}
          {selectedEmail && (
            <div className={`
              ${selectedEmail ? 'flex-1 md:flex-initial h-full overflow-hidden' : ''}
            `}>
              <EmailDetail
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
