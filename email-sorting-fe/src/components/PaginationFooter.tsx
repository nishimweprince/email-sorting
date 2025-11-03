import { Button } from '@/components/ui/button';

interface PaginationFooterProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250];

export default function PaginationFooter({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <footer className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
        <label htmlFor="page-size" className="shrink-0">
          Show:
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-xs sm:text-sm">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </footer>
  );
}
