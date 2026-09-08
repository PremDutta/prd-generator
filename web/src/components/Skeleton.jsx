// Shimmering placeholder blocks that mirror the shape of the content they
// stand in for, so a loading PRD list/card/page doesn't jump around once
// real data arrives.

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card px-6 py-5">
      <Skeleton className="mx-auto h-8 w-14" />
      <Skeleton className="mx-auto mt-3 h-3 w-20" />
    </div>
  );
}

export function PrdCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

export function LibraryRowSkeleton() {
  return (
    <div className="card flex items-center justify-between p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export function SectionCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-14" />
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}

export function PrdViewSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-7 w-72" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>
      <Skeleton className="mb-6 h-16 w-full rounded-lg" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SectionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
