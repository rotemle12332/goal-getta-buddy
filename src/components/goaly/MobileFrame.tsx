import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileFrame({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="relative w-full h-dvh bg-background flex flex-col overflow-hidden">
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-none ${hideNav ? "pb-4" : "pb-20"}`}
      >
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
