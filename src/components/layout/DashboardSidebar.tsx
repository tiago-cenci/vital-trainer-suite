import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  ClipboardList,
  Calendar,
  Settings,
  BarChart3,
  Target,
  LogOut,
  SearchCheck,
  BicepsFlexed
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Alunos', url: '/alunos', icon: Users },
  { title: 'Exercícios', url: '/exercicios', icon: Dumbbell },
  { title: 'Alongamentos/Mobilidades', url: '/alongamentos', icon: BicepsFlexed },
  { title: 'Treinos', url: '/treinos', icon: ClipboardList }, 
  { title: 'Correções', url: '/correcoes', icon: SearchCheck }
];

const configItems = [
  { title: 'Periodizações', url: '/periodizacoes', icon: Target },
  { title: 'Tipos de Microciclos', url: '/tipos-microciclos', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2v7H2V2h5zm0 13v7H2v-7h5zM21 2v7h-5V2h5zm0 13v7h-5v-7h5zM9 2h6v7H9V2zm0 13h6v7H9v-7z" opacity="0.6"/>
              <path d="M13 8h5v5h-5V8z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground tracking-tight">MUVTRAINER</h1>
              <p className="text-xs text-sidebar-foreground/70">Ciência aplicada</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}