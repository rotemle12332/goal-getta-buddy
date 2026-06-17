import { MoreHorizontal } from "lucide-react";

export function ScreenHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {action}
        <button className="size-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}
