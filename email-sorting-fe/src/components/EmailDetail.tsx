import type { Email } from '@/types';
import { emailsApi, processApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

export default function EmailDetail({ email, onClose }: EmailDetailProps) {
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
    <aside className="w-[600px] max-w-[50%] min-w-[400px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
      <style>{emailContentStyle}</style>

      <header className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-semibold truncate">Email Details</h2>
        <button
          onClick={onClose}
          className="p-2 bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 shrink-0 transition-colors"
          aria-label="Close email details"
        >
          ×
        </button>
      </header>

      <article className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold break-words">
            {email.subject}
          </h1>
        </header>

        <dl className="mb-6 text-sm space-y-2">
          <div className="flex gap-2 min-w-0">
            <dt className="font-medium text-gray-600 shrink-0">From:</dt>
            <dd className="truncate flex-1 min-w-0 m-0">{email.from}</dd>
          </div>
          <div className="flex gap-2 min-w-0">
            <dt className="font-medium text-gray-600 shrink-0">To:</dt>
            <dd className="truncate flex-1 min-w-0 m-0">{email.to}</dd>
          </div>
          <div className="flex gap-2 min-w-0">
            <dt className="font-medium text-gray-600 shrink-0">Date:</dt>
            <dd className="m-0">
              <time dateTime={email.date}>{new Date(email.date).toLocaleString()}</time>
            </dd>
          </div>
        </dl>

        <section className="p-4 bg-secondary-100 rounded-lg mb-6">
          <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-2">
            AI SUMMARY
          </h2>
          <p className="whitespace-pre-wrap break-words m-0">
            {email.aiSummary}
          </p>
        </section>

        {email.category && (
          <section className="mb-6">
            <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-2">
              CATEGORY
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 inline-block"
                style={{ backgroundColor: email.category.color || '#9bb4c0' }}
                aria-label={`Category: ${email.category.name}`}
              />
              <Badge variant="outline">{email.category.name}</Badge>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-2">
            EMAIL CONTENT
          </h2>
          <div className="email-content-wrapper break-words max-w-full overflow-x-hidden overflow-y-auto min-w-0">
            {email.bodyHtml || (email.body && (email.body.trim().startsWith('<!DOCTYPE') || email.body.includes('<html'))) ? (
              <div
                dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.body }}
                className="max-w-full overflow-hidden break-words"
              />
            ) : (
              <pre className="whitespace-pre-wrap break-words m-0 font-[inherit] text-[inherit]">
                {email.body}
              </pre>
            )}
          </div>
        </section>
      </article>

      <footer className="p-4 border-t border-gray-200 flex gap-2 shrink-0">
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="flex-1"
        >
          Delete
        </Button>
        {email.unsubscribeLink && (
          <Button
            onClick={handleUnsubscribe}
            className="flex-1 bg-accent-400 hover:bg-accent-500"
          >
            Unsubscribe
          </Button>
        )}
      </footer>
    </aside>
  );
}
