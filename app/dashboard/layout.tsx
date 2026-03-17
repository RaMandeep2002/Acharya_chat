import { AppSidebar } from '@/components/AppSideBar';
import { AuthProvider } from '../context/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AuthGuard } from './authgaurd';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <AuthGuard>
      <SidebarProvider>
        <div className="flex w-full flex-col md:flex-row h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <DashboardHeader />
            <main className="relative flex-1 flex flex-col bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-neutral-900 dark:via-gray-900 dark:to-neutral-950 overflow-hidden">
              {/* Prevent scrolling here too */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {children}
              </div>  
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  </AuthProvider>
  );
}