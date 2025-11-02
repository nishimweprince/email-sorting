import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import type { Email } from '../types';

export default function Dashboard() {
  const { user } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            AI Email Sorting
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{user?.email}</span>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            flex: selectedEmail ? '0 1 auto' : '1',
            minWidth: 0,
            overflow: 'hidden',
            maxWidth: selectedEmail ? '50%' : '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
