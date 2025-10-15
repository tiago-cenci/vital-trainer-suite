import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function LeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram: '',
    numAlunos: '',
    objetivo: '',
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast({
        title: 'Consentimento necessário',
        description: 'Por favor, aceite os termos de privacidade para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulação de envio (substituir por integração real)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast({
        title: 'Teste grátis iniciado! 🎉',
        description: 'Enviamos as instruções de acesso para seu email.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        instagram: '',
        numAlunos: '',
        objetivo: '',
        consent: false,
      });

      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="dashboard-card p-8 lg:p-12 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-white" size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Sucesso! Você está dentro! 🎉</h3>
          <p className="text-muted-foreground">
            Enviamos as instruções de acesso para <strong>{formData.email}</strong>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Verifique sua caixa de entrada (e spam, por via das dúvidas).
        </p>
      </div>
    );
  }

  return (
    <section id="comece-agora" className="py-20 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Comece seu <span className="text-primary">teste grátis</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              14 dias de acesso completo. Sem cartão de crédito necessário.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="dashboard-card p-8 lg:p-12 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email profissional *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (opcional)</Label>
              <Input
                id="instagram"
                type="text"
                placeholder="@seuperfil"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numAlunos">Número médio de alunos *</Label>
              <Select value={formData.numAlunos} onValueChange={(value) => handleChange('numAlunos', value)} required>
                <SelectTrigger id="numAlunos">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10">0-10 alunos</SelectItem>
                  <SelectItem value="11-30">11-30 alunos</SelectItem>
                  <SelectItem value="31-50">31-50 alunos</SelectItem>
                  <SelectItem value="51+">51+ alunos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo principal *</Label>
              <Select value={formData.objetivo} onValueChange={(value) => handleChange('objetivo', value)} required>
                <SelectTrigger id="objetivo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="escalar">Escalar base de alunos</SelectItem>
                  <SelectItem value="organizar">Organizar atendimento</SelectItem>
                  <SelectItem value="profissionalizar">Profissionalizar consultoria</SelectItem>
                  <SelectItem value="periodizacao">Melhorar periodização</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => handleChange('consent', checked as boolean)}
                required
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                Aceito receber comunicações do MUVTRAINER e concordo com a{' '}
                <a href="#" className="text-primary underline">
                  Política de Privacidade
                </a>{' '}
                conforme LGPD.
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full fitness-button"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Processando...
                </>
              ) : (
                'Começar teste grátis agora'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao enviar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
