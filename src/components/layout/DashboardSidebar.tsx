import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users, Dumbbell, ClipboardList, BarChart3, Target, LogOut,
  SearchCheck, BicepsFlexed, Settings2
} from 'lucide-react';
import wordmarkLogo from '@/assets/muvtrainer-logo.svg';
import iconLogo from '@/assets/icon-logo.svg';

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
  { title: 'Correções', url: '/correcoes', icon: SearchCheck },
];

const configItems = [
  { title: 'Periodizações', url: '/periodizacoes', icon: Target },
  { title: 'Tipos de Microciclos', url: '/tipos-microciclos', icon: Settings2 },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut } = useAuth();
  const isActive = (p: string) => location.pathname === p;

  // Fallback de logo se asset falhar
  const [wordmarkOk, setWordmarkOk] = useState(true);
  const [iconOk, setIconOk] = useState(true);

  const itemBase =
    'transition-all duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))]';
  const iconCls = 'h-[18px] w-[18px] shrink-0';
  const navItemCls = (active: boolean) =>
    [
      active ? 'sidebar-item-active' : 'sidebar-item',
      collapsed ? 'justify-center px-2 py-3' : 'justify-start px-3 py-3',
      itemBase,
    ].join(' ');

  return (
    <Sidebar
      collapsible="icon"
      className="shrink-0 bg-sidebar text-sidebar border-r border-sidebar/20 sticky top-0 h-screen z-30 overflow-hidden"
    >
      {/* HEADER */}
<SidebarHeader
  className={
    (collapsed ? 'h-16' : 'h-28') +
    ' bg-sidebar border-b border-sidebar/30 flex items-center justify-center px-4'
  }
>
  {/* Logo aberta (wordmark) — fica montada sempre, só escondida quando colapsado */}
  <div className={collapsed ? 'hidden' : 'flex flex-col items-center gap-1'}>
    <img
      src={wordmarkLogo}
      alt="MUVTRAINER"
      className="h-14 w-auto object-contain"
      /* se o arquivo for escuro, ative: className += ' brightness-0 invert' */
    />
    <p className="text-[11px] leading-none text-sidebar/70 italic tracking-wide">
      Ciência aplicada
    </p>
  </div>

  {/* Logo colapsada (ícone) — montada sempre, visível só quando colapsado */}
  <div className={collapsed ? 'flex items-center justify-center' : 'hidden'}>
    <img
      src={iconLogo}
      alt="MUVTRAINER"
      className="h-9 w-9 object-contain"
      /* se o ícone for escuro: 'brightness-0 invert' */
    />
  </div>
</SidebarHeader>


      {/* MENU */}
      <SidebarContent className="px-3 py-6 bg-sidebar overflow-visible">
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'px-2 mb-3 text-xs uppercase tracking-wider font-semibold text-[hsl(var(--secondary))]'}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed ? 'space-y-1 items-center' : 'space-y-1'}>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end title={collapsed ? item.title : undefined} className={navItemCls(active)}>
                        <item.icon className={iconCls} strokeWidth={1.6} />
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
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'px-2 mb-3 text-xs uppercase tracking-wider font-semibold text-[hsl(var(--secondary))]'}>
            Configurações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed ? 'space-y-1 items-center' : 'space-y-1'}>
              {configItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end title={collapsed ? item.title : undefined} className={navItemCls(active)}>
                        <item.icon className={iconCls} strokeWidth={1.6} />
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

      {/* FOOTER */}
      <SidebarFooter className="border-t border-sidebar/30 p-3 bg-sidebar">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={(collapsed ? 'w-10 h-10 mx-auto' : 'w-full justify-start') + ' text-sidebar hover:bg-[hsl(var(--sidebar-accent)/0.5)] hover:text-sidebar transition-all duration-200 font-medium'}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className={iconCls} strokeWidth={1.6} />
          {!collapsed && <span className="ml-3 text-sm">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
