import type { Email } from '../types';
import { emailsApi, processApi } from '../utils/api';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

export default function EmailDetail({ email, onClose }: EmailDetailProps) {
  // Add CSS to constrain email content
  const emailContentStyle = `
    .email-content-wrapper img {
      max-width: 100% !important;
      height: auto !important;
    }
    .email-content-wrapper table {
      max-width: 100% !important;
      table-layout: auto !important;
    }
    .email-content-wrapper * {
      max-width: 100% !important;
      word-wrap: break-word !important;
    }
  `;

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
    <aside style={{
      width: '600px',
      maxWidth: '50%',
      minWidth: '400px',
      backgroundColor: 'white',
      borderLeft: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      <style>{emailContentStyle}</style>
      {/* Header */}
      <header style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Email Details</h2>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            flexShrink: 0
          }}
          aria-label="Close email details"
        >
          ×
        </button>
      </header>

      {/* Email Content */}
      <article style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem', minWidth: 0 }}>
        {/* Subject */}
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            margin: 0,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden'
          }}>
            {email.subject}
          </h1>
        </header>

        {/* From/To/Date */}
        <dl style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
          <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', minWidth: 0 }}>
            <dt style={{ fontWeight: '500', color: '#6b7280', flexShrink: 0 }}>From:</dt>
            <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, flex: 1, minWidth: 0 }}>{email.from}</dd>
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', minWidth: 0 }}>
            <dt style={{ fontWeight: '500', color: '#6b7280', flexShrink: 0 }}>To:</dt>
            <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, flex: 1, minWidth: 0 }}>{email.to}</dd>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 0 }}>
            <dt style={{ fontWeight: '500', color: '#6b7280', flexShrink: 0 }}>Date:</dt>
            <dd style={{ margin: 0 }}>
              <time dateTime={email.date}>{new Date(email.date).toLocaleString()}</time>
            </dd>
          </div>
        </dl>

        {/* AI Summary */}
        <section style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            AI SUMMARY
          </h2>
          <p style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            margin: 0,
            overflow: 'hidden'
          }}>
            {email.aiSummary}
          </p>
        </section>

        {/* Category */}
        {email.category && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
              CATEGORY
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: email.category.color || '#3b82f6',
                  flexShrink: 0,
                  display: 'inline-block'
                }}
                aria-label={`Category: ${email.category.name}`}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.category.name}</span>
            </div>
          </section>
        )}

        {/* Body */}
        <section>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            EMAIL CONTENT
          </h2>
          <div
            className="email-content-wrapper"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              minWidth: 0
            }}
          >
            {email.bodyHtml || (email.body && (email.body.trim().startsWith('<!DOCTYPE') || email.body.includes('<html'))) ? (
              <div
                dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.body }}
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            ) : (
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                margin: 0,
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}>
                {email.body}
              </pre>
            )}
          </div>
        </section>
      </article>

      {/* Actions */}
      <nav style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.5rem',
        flexShrink: 0
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
      </nav>
    </aside>
  );
}
