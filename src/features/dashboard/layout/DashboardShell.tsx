import type { ReactNode } from 'react';

import { DashboardSidebar } from './DashboardSidebar';

type DashboardShellProps = {
  children: ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="w-full flex-1 overflow-y-auto md:w-[calc(100vw-16rem)]">
        <div className="mx-auto h-full max-w-7xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
