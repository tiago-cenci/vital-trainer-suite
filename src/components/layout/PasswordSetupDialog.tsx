import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';

export function PasswordSetupDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const needsPassword = !user.user_metadata?.has_set_password;
  const isAluno = user.user_metadata?.invited_as === 'aluno';

  // Only show for personal trainers who haven't set password
  if (!needsPassword || isAluno) return null;

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Cadastre sua senha
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Você acessou pelo link de convite. Para continuar usando o sistema,
            é necessário cadastrar uma senha segura. Sem ela, você não conseguirá
            acessar novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={() => navigate('/set-password')}
            className="w-full sm:w-auto"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Cadastrar senha agora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
