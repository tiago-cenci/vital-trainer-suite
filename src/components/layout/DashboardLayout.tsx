import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { UserProfile } from './UserProfile';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function DashboardLayout({ children, breadcrumbs = [] }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      {/* FLEX resolve o sumiço do menu e evita conflitos com o Sidebar */}
      <div className="min-h-screen w-full flex bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {crumb.href ? (
                              <BreadcrumbLink
                                href={crumb.href}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {crumb.label}
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage className="text-foreground font-medium">
                                {crumb.label}
                              </BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>

              <div className="flex items-center gap-4">
                <UserProfile />
              </div>
            </div>
          </header>

          {/* Só o conteúdo rola */}
          <main className="flex-1 p-8 bg-background overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
