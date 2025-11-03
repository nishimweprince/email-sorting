import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/useAppContext';
import { emailsApi, processApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlertModal from '@/components/ui/alert-modal';
import ConfirmModal from '@/components/ui/confirm-modal';
import EmailListSkeleton from '@/components/EmailListSkeleton';
import PaginationFooter from '@/components/PaginationFooter';
import type { Email } from '@/types';
import type { AxiosError } from 'axios';

interface EmailListProps {
  categoryId: string | null;
  onSelectEmail: (email: Email) => void;
  selectedEmailId?: string;
  reloadTrigger?: number; // When this changes, emails will be reloaded
}

export default function EmailList({ categoryId, onSelectEmail, selectedEmailId, reloadTrigger }: EmailListProps) {
  const { selectedEmails, selectEmail, deselectEmail, selectAllEmails, deselectAllEmails } = useApp();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalEmails, setTotalEmails] = useState(0);
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void | Promise<void>; variant?: 'default' | 'destructive'; loading?: boolean }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'default',
    loading: false
  });

  const loadEmails = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const response = categoryId
        ? await emailsApi.getByCategory(categoryId, { limit: pageSize, offset })
        : await emailsApi.getAll({ limit: pageSize, offset });
      setEmails(response.data.emails || response.data);
      setTotalEmails(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load emails', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentPage, pageSize]);

  useEffect(() => {
    loadEmails();
  }, [categoryId, loadEmails, reloadTrigger]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      deselectAllEmails();
    } else {
      selectAllEmails(emails.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    setConfirmModal({
      open: true,
      title: 'Delete Emails',
      message: `Are you sure you want to delete ${selectedEmails.length} email(s)?`,
      variant: 'destructive',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await emailsApi.bulkDelete(selectedEmails);
          setConfirmModal(prev => ({ ...prev, loading: false, open: false }));
          deselectAllEmails();
          loadEmails();
          setAlertModal({
            open: true,
            title: 'Success',
            message: 'Emails deleted successfully',
            type: 'success'
          });
        } catch (error: unknown) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          setAlertModal({
            open: true,
            title: 'Error',
            message: (error as unknown as AxiosError<{ error?: string }>)?.response?.data?.error || 'Failed to delete emails',
            type: 'error'
          });
        }
      }
    });
  };

  const handleBulkUnsubscribe = async () => {
    setConfirmModal({
      open: true,
      title: 'Unsubscribe',
      message: `Are you sure you want to unsubscribe from ${selectedEmails.length} email list(s)?`,
      variant: 'default',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await processApi.bulkUnsubscribe(selectedEmails);
          setConfirmModal(prev => ({ ...prev, loading: false, open: false }));
          deselectAllEmails();
          setAlertModal({
            open: true,
            title: 'Success',
            message: 'Unsubscribe process completed',
            type: 'success'
          });
        } catch (error: unknown) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          setAlertModal({
            open: true,
            title: 'Error',
            message: (error as unknown as AxiosError<{ error?: string }>)?.response?.data?.error || 'Failed to unsubscribe',
            type: 'error'
          });
        }
      }
    });
  };

  if (loading) {
    return <EmailListSkeleton />;
  }

  return (
    <section className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
      {selectedEmails.length > 0 && (
        <nav className="px-3 sm:px-4 py-2 sm:py-3 bg-primary-400 text-white flex gap-2 sm:gap-4 items-center shrink-0 overflow-hidden">
          <span className="truncate text-sm sm:text-base">{selectedEmails.length} selected</span>
          <Button
            onClick={handleBulkDelete}
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white text-primary-500 hover:bg-gray-100 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
          >
            Delete
          </Button>
          <Button
            onClick={handleBulkUnsubscribe}
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white text-primary-500 hover:bg-gray-100 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 hidden sm:inline-flex"
          >
            Unsubscribe
          </Button>
          <Button
            onClick={deselectAllEmails}
            size="sm"
            variant="outline"
            className="shrink-0 bg-white/20 text-white border-white hover:bg-white/30 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
          >
            Clear
          </Button>
        </nav>
      )}

      <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-gray-200 flex items-center gap-2 shrink-0">
        <input
          type="checkbox"
          checked={emails.length > 0 && selectedEmails.length === emails.length}
          onChange={handleSelectAll}
          className="cursor-pointer shrink-0"
          id="select-all-emails"
        />
        <label htmlFor="select-all-emails" className="text-xs sm:text-sm text-gray-600 truncate cursor-pointer">
          Select All ({emails.length})
        </label>
      </header>

      <ul className="flex-1 overflow-y-auto overflow-x-hidden list-none m-0 p-0">
        {emails.length === 0 ? (
          <li className="p-8 text-center text-gray-500">
            No emails found. Click "Sync Emails" to import from Gmail.
          </li>
        ) : (
          emails.map((email) => (
            <li key={email.id}>
              <article
                className={`p-3 sm:p-4 border-b border-gray-200 cursor-pointer flex gap-2 sm:gap-3 min-w-0 transition-colors ${
                  selectedEmailId === email.id ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                }`}
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
                  className="cursor-pointer shrink-0 mt-0.5 sm:mt-1"
                  aria-label={`Select email: ${email.subject}`}
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between mb-1 gap-1.5 sm:gap-2">
                    <span className="font-medium truncate flex-1 min-w-0 text-sm sm:text-base">
                      {email.from}
                    </span>
                    <time className="text-xs sm:text-xs text-gray-500 shrink-0" dateTime={email.date}>
                      {new Date(email.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  <h3 className="font-medium mb-0.5 sm:mb-1 truncate text-sm sm:text-base m-0">
                    {email.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate m-0">
                    {email.aiSummary}
                  </p>
                  {email.category && (
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                      <span
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 inline-block"
                        style={{ backgroundColor: email.category.color || '#9bb4c0' }}
                        aria-label={`Category: ${email.category.name}`}
                      />
                      <Badge variant="outline" className="text-xs truncate">
                        {email.category.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
      {totalEmails > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalEmails}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
      <AlertModal
        open={alertModal.open}
        onClose={() => setAlertModal({ ...alertModal, open: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant || 'default'}
        loading={confirmModal.loading}
      />
    </section>
  );
}
