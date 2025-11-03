import { Skeleton } from '@/components/ui/skeleton';

export default function EmailDetailSkeleton() {
  return (
    <aside className="w-full md:w-[600px] md:max-w-[50%] md:min-w-[400px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      <header className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-8 rounded" />
      </header>

      <article className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 min-w-0 min-h-0">
        <header className="mb-4 sm:mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
        </header>

        <dl className="mb-4 sm:mb-6 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
        </dl>

        <section className="p-3 sm:p-4 bg-secondary-100 rounded-lg mb-4 sm:mb-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </section>

        <section className="mb-4 sm:mb-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-32" />
        </section>

        <section>
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </section>
      </article>

      <footer className="p-3 sm:p-4 border-t border-gray-200 flex gap-2 shrink-0">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </footer>
    </aside>
  );
}
