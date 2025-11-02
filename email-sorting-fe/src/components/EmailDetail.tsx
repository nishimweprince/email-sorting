import type { Email } from '@/types';
import { emailsApi, processApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AxiosError } from 'node_modules/axios/index.d.cts';

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
    } catch (error: unknown) {
      alert((error as AxiosError<{ error?: string }>)?.response?.data?.error || 'Failed to delete email');
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
    } catch (error: unknown) {
      alert((error as unknown as AxiosError<{ error?: string }>)?.response?.data?.error || 'Failed to unsubscribe');
    }
  };

  return (
    <aside className="w-full md:w-[600px] md:max-w-[50%] md:min-w-[400px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
      <style>{emailContentStyle}</style>

      <header className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <h2 className="text-lg sm:text-xl font-semibold truncate">Email Details</h2>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 bg-transparent border-none text-2xl sm:text-3xl cursor-pointer text-gray-500 hover:text-gray-700 shrink-0 transition-colors"
          aria-label="Close email details"
        >
          ×
        </button>
      </header>

      <article className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-w-0">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold wrap-break-word">
            {email.subject}
          </h1>
        </header>

        <dl className="mb-4 sm:mb-6 text-xs sm:text-sm space-y-1.5 sm:space-y-2">
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
              <time dateTime={email.date}>
                {new Date(email.date).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </time>
            </dd>
          </div>
        </dl>

        <section className="p-3 sm:p-4 bg-secondary-100 rounded-lg mb-4 sm:mb-6">
          <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-1.5 sm:mb-2">
            AI SUMMARY
          </h2>
          <p className="whitespace-pre-wrap wrap-break-word m-0 text-sm sm:text-base">
            {email.aiSummary}
          </p>
        </section>

        {email.category && (
          <section className="mb-4 sm:mb-6">
            <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-1.5 sm:mb-2">
              CATEGORY
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 inline-block"
                style={{ backgroundColor: email.category.color || '#9bb4c0' }}
                aria-label={`Category: ${email.category.name}`}
              />
              <Badge variant="outline" className="text-xs sm:text-sm">{email.category.name}</Badge>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold text-xs text-gray-600 tracking-wide mb-1.5 sm:mb-2">
            EMAIL CONTENT
          </h2>
          <div className="email-content-wrapper wrap-break-word max-w-full overflow-x-auto overflow-y-auto min-w-0 text-sm sm:text-base">
            {email.bodyHtml || (email.body && (email.body.trim().startsWith('<!DOCTYPE') || email.body.includes('<html'))) ? (
              <div
                dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.body }}
                className="max-w-full overflow-hidden wrap-break-word"
              />
            ) : (
              <pre className="whitespace-pre-wrap wrap-break-word m-0 font-[inherit] text-inherit">
                {email.body}
              </pre>
            )}
          </div>
        </section>
      </article>

      <footer className="p-3 sm:p-4 border-t border-gray-200 flex gap-2 shrink-0">
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
          size="sm"
        >
          Delete
        </Button>
        {email.unsubscribeLink && (
          <Button
            onClick={handleUnsubscribe}
            className="flex-1 bg-accent-400 hover:bg-accent-500 text-xs sm:text-sm h-9 sm:h-10"
            size="sm"
          >
            Unsubscribe
          </Button>
        )}
      </footer>
    </aside>
  );
}
