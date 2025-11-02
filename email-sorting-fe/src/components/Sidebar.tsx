import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { processApi } from '../utils/api';
import CategoryModal from './CategoryModal';

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
      onSelectCategory(null); // Refresh the email list
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Sync Button */}
      <div style={{ padding: '1rem' }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: syncing ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500',
            cursor: syncing ? 'not-allowed' : 'pointer'
          }}
        >
          {syncing ? 'Syncing...' : 'Sync Emails'}
        </button>
      </div>

      {/* All Emails */}
      <div
        onClick={() => onSelectCategory(null)}
        style={{
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          backgroundColor: selectedCategoryId === null ? '#f3f4f6' : 'transparent',
          borderLeft: selectedCategoryId === null ? '3px solid #3b82f6' : '3px solid transparent'
        }}
      >
        <div style={{ fontWeight: '500' }}>All Emails</div>
      </div>

      {/* Categories Header */}
      <div style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#6b7280' }}>
          CATEGORIES
        </span>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          + Add
        </button>
      </div>

      {/* Category List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              backgroundColor: selectedCategoryId === category.id ? '#f3f4f6' : 'transparent',
              borderLeft: selectedCategoryId === category.id ? '3px solid #3b82f6' : '3px solid transparent',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: category.color || '#3b82f6'
                }}
              />
              <span>{category.name}</span>
            </div>
            {category._count && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: '#e5e7eb',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px'
              }}>
                {category._count.emails}
              </span>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <CategoryModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refreshCategories();
          }}
        />
      )}
    </div>
  );
}
