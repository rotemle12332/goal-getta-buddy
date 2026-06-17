import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileFrame({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="relative w-full min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 scrollbar-none">
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
