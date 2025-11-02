import type { Email } from '../types';
import { emailsApi, processApi } from '../utils/api';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

export default function EmailDetail({ email, onClose }: EmailDetailProps) {
  const handleDelete = async () => {
    if (!confirm('Delete this email?')) return;

    try {
      await emailsApi.delete(email.id);
      alert('Email deleted successfully');
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete email');
    }
  };

  const handleUnsubscribe = async () => {
    if (!email.unsubscribeLink) {
      alert('No unsubscribe link found for this email');
      return;
    }

    if (!confirm('Unsubscribe from this email list?')) return;

    try {
      await processApi.unsubscribe(email.id);
      alert('Unsubscribe process completed');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unsubscribe');
    }
  };

  return (
    <div style={{
      width: '600px',
      backgroundColor: 'white',
      borderLeft: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Email Details</h2>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>
      </div>

      {/* Email Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {/* Subject */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {email.subject}
          </h3>
        </div>

        {/* From/To/Date */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>From: </span>
            <span>{email.from}</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>To: </span>
            <span>{email.to}</span>
          </div>
          <div>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>Date: </span>
            <span>{new Date(email.date).toLocaleString()}</span>
          </div>
        </div>

        {/* AI Summary */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            AI SUMMARY
          </div>
          <div>{email.aiSummary}</div>
        </div>

        {/* Category */}
        {email.category && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              CATEGORY
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: email.category.color || '#3b82f6'
                }}
              />
              <span>{email.category.name}</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            EMAIL CONTENT
          </div>
          {email.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{email.body}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
        {email.unsubscribeLink && (
          <button
            onClick={handleUnsubscribe}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Unsubscribe
          </button>
        )}
      </div>
    </div>
  );
}
