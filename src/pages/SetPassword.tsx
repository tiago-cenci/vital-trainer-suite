import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo de 8 caracteres', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Pelo menos uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Pelo menos uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Pelo menos um número', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'Pelo menos um caractere especial (!@#$...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && !session.user.user_metadata?.has_set_password) {
          setAuthorized(true);
          setChecking(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !session.user.user_metadata?.has_set_password) {
        setAuthorized(true);
      } else if (session?.user.user_metadata?.has_set_password) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPass && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { has_set_password: true },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast({
        title: 'Senha criada com sucesso!',
        description: 'Agora você pode fazer login com seu e-mail e senha.',
      });

      // Sign out so they login fresh with the new password
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <AuthLayout title="Acesso não autorizado" subtitle="Este link é exclusivo para novos alunos convidados.">
        <Alert variant="destructive">
          <AlertDescription>
            Você precisa acessar esta página através do link de convite enviado por e-mail.
          </AlertDescription>
        </Alert>
        <Button variant="fitness" className="w-full mt-4" onClick={() => navigate('/login')}>
          Ir para Login
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie sua senha" subtitle="Defina uma senha segura para acessar sua conta">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Crie sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password strength rules */}
        {password.length > 0 && (
          <div className="space-y-1.5 rounded-md border border-border bg-muted/30 p-3">
            {PASSWORD_RULES.map((rule) => {
              const passes = rule.test(password);
              return (
                <div key={rule.id} className="flex items-center gap-2 text-sm">
                  {passes ? (
                    <Check size={14} className="text-primary shrink-0" />
                  ) : (
                    <X size={14} className="text-destructive shrink-0" />
                  )}
                  <span className={passes ? 'text-foreground' : 'text-muted-foreground'}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirme a senha</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-sm text-destructive">As senhas não coincidem</p>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit} variant="fitness" className="w-full h-12">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Criar senha e acessar'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
