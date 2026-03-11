import React from 'react';
import { LogOut, Mail, Phone, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  const initials = displayName
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const needsPassword = !user.user_metadata?.has_set_password && (
    user.user_metadata?.invited_as === 'aluno' || 
    !user.user_metadata?.full_name
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 relative">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{displayName}</span>
          {needsPassword && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Personal Trainer
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {needsPassword && (
          <>
            <DropdownMenuItem
              onClick={() => navigate('/set-password')}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Cadastrar senha</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem className="cursor-default">
          <Mail className="mr-2 h-4 w-4" />
          <span className="text-sm">{user.email}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-default">
          <Phone className="mr-2 h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {user.user_metadata?.phone || 'Não informado'}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

