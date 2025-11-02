import { useState } from 'react';
import { categoriesApi } from '@/utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryModal({ onClose, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#9bb4c0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await categoriesApi.create({ name, description, color });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your emails
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <label htmlFor="category-name" className="block font-medium text-sm">
              Name
            </label>
            <Input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Work, Personal, Newsletters"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="category-description" className="block font-medium text-sm">
              Description
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe what emails should be categorized here..."
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="category-color" className="block font-medium text-sm">
              Color
            </label>
            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-24 h-10 rounded-md border border-gray-200 cursor-pointer"
            />
          </fieldset>

          <footer className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-400 hover:bg-primary-500"
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
