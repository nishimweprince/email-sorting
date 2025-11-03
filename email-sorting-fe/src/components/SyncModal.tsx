import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SyncModalProps {
  onClose: () => void;
  onConfirm: (maxResults: number, includeSpam: boolean, includeTrash: boolean) => void | Promise<void>;
  loading?: boolean;
}

const SYNC_OPTIONS = [10, 25, 50, 100, 250, 500];

export default function SyncModal({ onClose, onConfirm, loading }: SyncModalProps) {
  const [maxResults, setMaxResults] = useState(50);
  const [includeSpam, setIncludeSpam] = useState(false);
  const [includeTrash, setIncludeTrash] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(maxResults, includeSpam, includeTrash);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Sync Emails from Gmail</DialogTitle>
          <DialogDescription>
            Choose how many emails to sync and which folders to include
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <label htmlFor="max-results" className="block font-medium text-sm">
              Number of Emails to Sync
            </label>
            <select
              id="max-results"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {SYNC_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} emails
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="block font-medium text-sm mb-2">Include Folders</legend>

            <div className="flex items-center gap-2">
              <input
                id="include-spam"
                type="checkbox"
                checked={includeSpam}
                onChange={(e) => setIncludeSpam(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-400 focus:ring-primary-400 cursor-pointer"
              />
              <label htmlFor="include-spam" className="text-sm cursor-pointer">
                Include Spam folder
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="include-trash"
                type="checkbox"
                checked={includeTrash}
                onChange={(e) => setIncludeTrash(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-400 focus:ring-primary-400 cursor-pointer"
              />
              <label htmlFor="include-trash" className="text-sm cursor-pointer">
                Include Trash folder
              </label>
            </div>
          </fieldset>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You will be notified when the sync is completed.
              This process may take a few minutes depending on the number of emails.
            </p>
          </div>

          <footer className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-400 hover:bg-primary-500"
            >
              {loading ? 'Syncing...' : 'Start Sync'}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
