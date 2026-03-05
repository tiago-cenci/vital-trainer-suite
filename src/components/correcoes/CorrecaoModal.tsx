import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, UploadCloud, ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useExecucao, useCorrecaoAtual, useSalvarCorrecao, useUploadMidiaCorrecao, useMidiasCorrecao, useDeleteMidiaCorrecao } from '@/hooks/useCorrecao';
import { useExecVideoUrl } from '@/hooks/useExecVideoUrl';
import { useExercicioFromExec, useMediaNotaExercicio } from '@/hooks/useCorrecaoExtra';
import { MidiaThumb } from './MidiaThumb';
import { StarRating, StarRatingDisplay } from '@/components/ui/star-rating';

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
  execId, open, onOpenChange, onNext, onPrev,
  currentIndex = 0, totalVideos = 1,
}: CorrecaoModalProps) {
  const { data: exec, isLoading: loadingExec } = useExecucao(execId || '');
  const { data: correcao, isLoading: loadingCorr } = useCorrecaoAtual(execId || '');
  const { data: videoUrl, isLoading: loadingVideo } = useExecVideoUrl(exec?.video_path);
  const { data: midias = [] } = useMidiasCorrecao(correcao?.id);
  const { data: exercicio } = useExercicioFromExec(execId);
  const { data: mediaNota } = useMediaNotaExercicio(execId);

  const salvar = useSalvarCorrecao(execId || '');
  const upload = useUploadMidiaCorrecao(correcao?.id);
  const deleteMidia = useDeleteMidiaCorrecao(correcao?.id);

  const [texto, setTexto] = useState<string>('');
  const [nota, setNota] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexto(correcao?.texto ?? '');
    setNota(correcao?.pontuacao_opcional ?? null);
  }, [correcao?.id, execId]);

  const disableActions = salvar.isPending || upload.isPending || loadingExec || loadingCorr;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      upload.mutate(Array.from(files));
    }
    e.currentTarget.value = '';
  };

  const handleRemoveMidia = (midia: any) => {
    setRemovingId(midia.id);
    deleteMidia.mutate(midia, {
      onSettled: () => setRemovingId(null),
    });
  };

  const handleSave = (status: 'RASCUNHO' | 'ENVIADA') => {
    salvar.mutate({ id: correcao?.id, texto, status, pontuacao: nota });
  };

  const statusBadge = !correcao 
    ? <Badge variant="outline">Nova correção</Badge>
    : correcao.status === 'ENVIADA' 
      ? <Badge>Enviada</Badge>
      : <Badge variant="secondary">Rascunho</Badge>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-2xl font-bold">
                {exercicio?.nome ?? 'Correção de Execução'}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {totalVideos > 1 && (
                  <span className="font-medium">Vídeo {currentIndex + 1} de {totalVideos}</span>
                )}
                {statusBadge}
                {mediaNota !== null && mediaNota !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Média:</span>
                    <StarRatingDisplay value={mediaNota} size="sm" />
                  </div>
                )}
              </div>
            </div>
            {totalVideos > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onPrev} disabled={disableActions}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={onNext} disabled={disableActions}>
                  Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* LEFT: video + info */}
            <div className="lg:col-span-3 p-4 sm:p-6 lg:border-r space-y-4">
              {/* Video */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Vídeo da Execução</Label>
                </div>
                {exec?.video_path ? (
                  videoUrl ? (
                    <video controls className="w-full rounded-xl border shadow-sm bg-black max-h-[50vh]" src={videoUrl} key={videoUrl} />
                  ) : (
                    <div className="w-full aspect-video bg-muted rounded-xl animate-pulse flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <div className="p-6 bg-muted rounded-xl text-center">
                    <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Execução sem vídeo</p>
                  </div>
                )}
              </div>

              {/* Exec info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Início
                  </div>
                  <div className="font-medium">
                    {exec?.started_at ? format(new Date(exec.started_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR }) : '—'}
                  </div>
                </div>
                {exec?.ended_at && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> Fim
                    </div>
                    <div className="font-medium">
                      {format(new Date(exec.ended_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: feedback + rating + upload + media */}
            <div className="lg:col-span-2 p-4 sm:p-6 space-y-4 border-t lg:border-t-0">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nota da Execução</Label>
                <StarRating value={nota} onChange={setNota} size="lg" showLabel />
                <p className="text-xs text-muted-foreground">
                  Opcional. Clique na mesma estrela para remover a nota.
                </p>
              </div>

              <Separator />

              {/* Feedback text */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Feedback da Correção *</Label>
                <Textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Explique pontos de postura, técnica, amplitude, respiração, carga, tempo de descanso, etc."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Seja específico e construtivo. O aluno verá essa mensagem no app.
                </p>
              </div>

              <Separator />

              {/* Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Anexar Fotos ou Vídeos</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                  disabled={!correcao?.id || upload.isPending}
                >
                  {upload.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                  ) : (
                    <><UploadCloud className="h-4 w-4 mr-2" /> {correcao?.id ? 'Selecionar arquivos' : 'Salve um rascunho antes'}</>
                  )}
                </Button>
              </div>

              {/* Media thumbnails */}
              {midias.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Mídias Anexadas ({midias.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {midias.map((m) => (
                      <MidiaThumb
                        key={m.id}
                        bucket="correcoes"
                        path={m.path}
                        tipo={m.tipo as any}
                        onRemove={() => handleRemoveMidia(m)}
                        removing={removingId === m.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={disableActions || !texto.trim()}
                  onClick={() => handleSave('RASCUNHO')}
                  className="w-full"
                >
                  {salvar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Rascunho
                </Button>
                <Button
                  disabled={disableActions || !texto.trim()}
                  onClick={() => handleSave('ENVIADA')}
                  className="w-full"
                >
                  {salvar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar ao Aluno
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
