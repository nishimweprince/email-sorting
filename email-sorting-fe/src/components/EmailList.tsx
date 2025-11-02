import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { emailsApi, processApi } from '../utils/api';
import type { Email } from '../types';

interface EmailListProps {
  categoryId: string | null;
  onSelectEmail: (email: Email) => void;
  selectedEmailId?: string;
}

export default function EmailList({ categoryId, onSelectEmail, selectedEmailId }: EmailListProps) {
  const { selectedEmails, selectEmail, deselectEmail, selectAllEmails, deselectAllEmails } = useApp();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, [categoryId]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const response = categoryId
        ? await emailsApi.getByCategory(categoryId)
        : await emailsApi.getAll();
      setEmails(response.data.emails || response.data);
    } catch (error) {
      console.error('Failed to load emails', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      deselectAllEmails();
    } else {
      selectAllEmails(emails.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedEmails.length} emails?`)) return;

    try {
      await emailsApi.bulkDelete(selectedEmails);
      deselectAllEmails();
      loadEmails();
      alert('Emails deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete emails');
    }
  };

  const handleBulkUnsubscribe = async () => {
    if (!confirm(`Unsubscribe from ${selectedEmails.length} email lists?`)) return;

    try {
      await processApi.bulkUnsubscribe(selectedEmails);
      deselectAllEmails();
      alert('Unsubscribe process completed');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unsubscribe');
    }
  };

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Loading emails...</p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb',
      overflow: 'hidden'
    }}>
      {/* Bulk Actions Bar */}
      {selectedEmails.length > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <span>{selectedEmails.length} selected</span>
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: '#3b82f6',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Delete
          </button>
          <button
            onClick={handleBulkUnsubscribe}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: '#3b82f6',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Unsubscribe
          </button>
          <button
            onClick={deselectAllEmails}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid white',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Select All */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <input
          type="checkbox"
          checked={emails.length > 0 && selectedEmails.length === emails.length}
          onChange={handleSelectAll}
          style={{ cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Select All ({emails.length})
        </span>
      </div>

      {/* Email List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {emails.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No emails found. Click "Sync Emails" to import from Gmail.
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              style={{
                padding: '1rem',
                backgroundColor: selectedEmailId === email.id ? '#f3f4f6' : 'white',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem'
              }}
              onClick={() => onSelectEmail(email)}
            >
              <input
                type="checkbox"
                checked={selectedEmails.includes(email.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  if (selectedEmails.includes(email.id)) {
                    deselectEmail(email.id);
                  } else {
                    selectEmail(email.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.from}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.aiSummary}
                </div>
                {email.category && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: email.category.color || '#3b82f6'
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {email.category.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
