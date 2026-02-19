import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, UploadCloud, ChevronLeft, ChevronRight, Video, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useExecucao, useCorrecaoAtual, useSalvarCorrecao, useUploadMidiaCorrecao, useMidiasCorrecao } from '@/hooks/useCorrecao';
import { useExecVideoUrl } from '@/hooks/useExecVideoUrl';
import { MidiaThumb } from './MidiaThumb';

interface CorrecaoModalProps {
  execId?: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalVideos?: number;
}

export function CorrecaoModal({ 
  execId, 
  open, 
  onOpenChange, 
  onNext, 
  onPrev,
  currentIndex = 0,
  totalVideos = 1,
}: CorrecaoModalProps) {
  const { data: exec, isLoading: loadingExec } = useExecucao(execId || '');
  const { data: correcao, isLoading: loadingCorr } = useCorrecaoAtual(execId || '');
  const { data: videoUrl, isLoading: loadingVideo } = useExecVideoUrl(exec?.video_path);
  const { data: midias = [] } = useMidiasCorrecao(correcao?.id);

  const salvar = useSalvarCorrecao(execId || '');
  const upload = useUploadMidiaCorrecao(correcao?.id);

  const [texto, setTexto] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexto(correcao?.texto ?? '');
  }, [correcao?.id, execId]);

  const disableActions = salvar.isPending || upload.isPending || loadingExec || loadingCorr;

  const getStatusBadge = () => {
    if (!correcao) return <Badge variant="outline">Nova correção</Badge>;
    
    switch (correcao.status) {
      case 'ENVIADA':
        return <Badge>Enviada</Badge>;
      case 'RASCUNHO':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Sem correção</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold">Correção de Execução</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {totalVideos > 1 && (
                  <span className="font-medium">
                    Vídeo {currentIndex + 1} de {totalVideos}
                  </span>
                )}
                {getStatusBadge()}
              </div>
            </div>
            {totalVideos > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  disabled={disableActions}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={disableActions}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-full">
            {/* ESQUERDA: vídeo e informações - 3/5 */}
            <div className="lg:col-span-3 p-6 border-r overflow-y-auto">
              <div className="space-y-6">
                {/* Vídeo */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Vídeo da Execução</Label>
                  </div>
                  {exec?.video_path ? (
                    videoUrl ? (
                      <video 
                        controls 
                        className="w-full rounded-xl border shadow-sm bg-black" 
                        src={videoUrl}
                        key={videoUrl}
                      />
                    ) : (
                      <div className="w-full aspect-video bg-muted rounded-xl animate-pulse flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )
                  ) : (
                    <div className="p-8 bg-muted rounded-xl text-center">
                      <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Execução sem vídeo</p>
                    </div>
                  )}
                </div>

                {/* Informações da execução */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Início
                    </div>
                    <div className="text-sm font-medium">
                      {exec?.started_at 
                        ? format(new Date(exec.started_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })
                        : '—'}
                    </div>
                  </div>
                  {exec?.ended_at && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Fim
                      </div>
                      <div className="text-sm font-medium">
                        {format(new Date(exec.ended_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Mídias anexadas */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-semibold">Mídias Anexadas à Correção</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {midias.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Nenhuma mídia anexada ainda. Use o botão ao lado para adicionar.
                      </div>
                    ) : (
                      midias.map((m) => (
                        <MidiaThumb key={m.id} bucket="correcoes" path={m.path} tipo={m.tipo as any} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DIREITA: editor e ações - 2/5 */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {/* Editor de texto */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Feedback da Correção *</Label>
                    <Textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Explique pontos de postura, técnica, amplitude, respiração, carga, tempo de descanso, etc."
                      rows={12}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Seja específico e construtivo no feedback. O aluno verá essa mensagem no app.
                    </p>
                  </div>

                  <Separator />

                  {/* Upload de anexos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Anexar Foto ou Vídeo</Label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) upload.mutate(f);
                        e.currentTarget.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileRef.current?.click()}
                      disabled={!correcao?.id || upload.isPending}
                    >
                      {upload.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {correcao?.id ? 'Adicionar mídia' : 'Salve um rascunho antes'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>

              {/* Ações */}
              <div className="p-6 border-t bg-muted/20">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    disabled={disableActions || !texto.trim()}
                    onClick={() => salvar.mutate({ id: correcao?.id, texto, status: 'RASCUNHO' })}
                    className="w-full"
                  >
                    {salvar.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Salvar Rascunho
                  </Button>
                  <Button
                    disabled={disableActions || !texto.trim()}
                    onClick={() => salvar.mutate({ id: correcao?.id, texto, status: 'ENVIADA' })}
                    className="w-full"
                  >
                    {salvar.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Enviar ao Aluno
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
