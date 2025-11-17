import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-screen">
      <Skeleton className="h-20 w-full" />
      <div className="flex-1 p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full max-w-2xl" />
          </div>
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
