import { ReactNode, useState } from "react";

import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  fluid?: boolean;
}

export function AppLayout({ children, title, fluid = false }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile sidebar (overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative z-10 fade-in">
            <AppSidebar onNavItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin bg-app-aurora">
          <div
            className={`mx-auto w-full ${fluid ? "max-w-[1600px]" : "max-w-[1440px]"} space-y-6 p-4 md:p-8 lg:p-10 fade-in`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
