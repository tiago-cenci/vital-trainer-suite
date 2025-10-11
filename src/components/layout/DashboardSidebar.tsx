import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  ClipboardList,
  BarChart3,
  Target,
  LogOut,
  SearchCheck,
  BicepsFlexed,
  Settings2
} from 'lucide-react';
import muvtrainerLogo from '@/assets/muvtrainer-logo.png';
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
  { title: 'Tipos de Microciclos', url: '/tipos-microciclos', icon: Settings2 },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={collapsed ? "w-16 transition-all duration-300" : "w-72 transition-all duration-300"}
      collapsible="icon"
      style={{ 
        backgroundColor: 'hsl(var(--sidebar-background))',
        borderRight: 'none'
      }}
    >
      {/* Header com Logo */}
      <SidebarHeader className="border-b border-sidebar-accent/30 h-20">
        <div className="flex items-center justify-center h-full px-6 py-5">
          {!collapsed ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <img 
                src={muvtrainerLogo} 
                alt="MUVTRAINER" 
                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
              />
              <p className="text-xs text-sidebar-foreground/70 font-light italic tracking-wide">
                Ciência aplicada
              </p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sidebar-accent/50">
              <svg className="w-5 h-5 text-sidebar-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 8h5v5h-5V8z" />
              </svg>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        {/* Menu Principal */}
        <SidebarGroup className="mb-8">
          <SidebarGroupLabel className="px-3 mb-3 text-xs uppercase tracking-wider text-sidebar-foreground/50 font-semibold">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end
                        className={
                          active
                            ? "sidebar-item-active"
                            : "sidebar-item"
                        }
                      >
                        <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-3 text-xs uppercase tracking-wider text-sidebar-foreground/50 font-semibold">
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {configItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end
                        className={
                          active
                            ? "sidebar-item-active"
                            : "sidebar-item"
                        }
                      >
                        <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Sair */}
      <SidebarFooter className="border-t border-sidebar-accent/30 p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 font-medium"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {!collapsed && <span className="ml-3 text-sm">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}