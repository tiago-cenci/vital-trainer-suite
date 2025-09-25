import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UploadCloud } from 'lucide-react';

import { useExecucao, useCorrecaoAtual, useSalvarCorrecao, useUploadMidiaCorrecao, useMidiasCorrecao } from '@/hooks/useCorrecao';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { MidiaThumb } from './MidiaThumb';

interface CorrecaoModalProps {
  execId?: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CorrecaoModal({ execId, open, onOpenChange }: CorrecaoModalProps) {
  const { data: exec, isLoading: loadingExec } = useExecucao(execId || '');
  const { data: correcao, isLoading: loadingCorr } = useCorrecaoAtual(execId || '');
    // src/components/correcoes/CorrecaoModal.tsx
    const { data: videoUrl } = useSignedUrl('exercicio-videos', exec?.video_path ?? null);
  const { data: midias = [] } = useMidiasCorrecao(correcao?.id);

  const salvar = useSalvarCorrecao(execId || '');
  const upload = useUploadMidiaCorrecao(correcao?.id);

  const [texto, setTexto] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setTexto(correcao?.texto ?? '');
  }, [correcao?.id]); // ao trocar a correção carregada

  const disableActions = salvar.isPending || upload.isPending || loadingExec || loadingCorr;
  console.log(exec?.video_path)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Correção da execução</DialogTitle>
          <DialogDescription>
            Revise o vídeo, escreva o feedback obrigatório e (opcionalmente) anexe mídias.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* ESQUERDA: vídeo + histórico simples */}
          <div className="p-6 border-r">
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Execução</Label>
              {exec?.video_path ? (
                videoUrl ? (
                  <video controls className="w-full rounded-lg" src={videoUrl} />
                ) : (
                  <div className="w-full h-48 bg-muted rounded animate-pulse" />
                )
              ) : (
                <div className="p-6 bg-muted rounded text-sm">Execução sem vídeo (histórico apenas).</div>
              )}

              <div className="text-xs text-muted-foreground">
                <span>Início: {exec?.started_at ? new Date(exec.started_at).toLocaleString() : '—'}</span>
                {exec?.ended_at && <span> · Fim: {new Date(exec.ended_at).toLocaleString()}</span>}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label className="text-sm">Mídias anexadas pelo personal</Label>
              <div className="flex flex-wrap gap-2">
                {midias.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Nenhuma mídia anexada.</div>
                ) : (
                  midias.map((m) => (
                    <MidiaThumb key={m.id} bucket="correcoes" path={m.path} tipo={m.tipo as any} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DIREITA: editor + anexos + ações */}
          <div className="p-6">
            <ScrollArea className="h-[420px] pr-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto da correção *</Label>
                  <Textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Explique pontos de postura, ritmo, amplitude, respiração, etc."
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anexos (foto/vídeo)</Label>
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
                    variant="secondary"
                    onClick={() => fileRef.current?.click()}
                    disabled={!correcao?.id || upload.isPending}
                  >
                    {upload.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {correcao?.id ? 'Anexar mídia' : 'Salve um rascunho antes'}
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <Separator className="my-6" />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={disableActions || !texto.trim()}
                onClick={() => salvar.mutate({ id: correcao?.id, texto, status: 'RASCUNHO' })}
              >
                {salvar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar rascunho
              </Button>
              <Button
                disabled={disableActions || !texto.trim()}
                onClick={() => salvar.mutate({ id: correcao?.id, texto, status: 'ENVIADA' })}
              >
                {salvar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enviar ao aluno
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
