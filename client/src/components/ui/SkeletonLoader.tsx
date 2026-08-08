import clsx from 'clsx';

export function SkeletonLoader({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-gray-200', className)} />;
}

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonLoader className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-3 w-2/3" />
            <SkeletonLoader className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
