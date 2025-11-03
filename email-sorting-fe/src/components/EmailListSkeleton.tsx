import { Skeleton } from '@/components/ui/skeleton';

export default function EmailListSkeleton() {
  return (
    <section className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-w-0">
      <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-gray-200 flex items-center gap-2 shrink-0">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-4 w-32" />
      </header>

      <ul className="flex-1 overflow-y-auto overflow-x-hidden list-none m-0 p-0">
        {[...Array(8)].map((_, index) => (
          <li key={index} className="p-3 sm:p-4 border-b border-gray-200 bg-white">
            <article className="flex gap-2 sm:gap-3 min-w-0">
              <Skeleton className="w-4 h-4 shrink-0 mt-0.5 sm:mt-1" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between mb-1 gap-1.5 sm:gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-24 mt-2" />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
