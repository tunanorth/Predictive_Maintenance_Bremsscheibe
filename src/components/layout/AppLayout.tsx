import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F4F6] dark:bg-[#020817] transition-colors">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#F3F4F6] dark:bg-[#020817] transition-colors"
          style={{ minHeight: 0 }}
        >
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
