-- Create table for microcycle types (templates for weeks)
CREATE TABLE public.tipos_microciclos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipos_microciclos ENABLE ROW LEVEL SECURITY;

-- Create policies for tipos_microciclos
CREATE POLICY "Users can view their own tipos_microciclos" 
ON public.tipos_microciclos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tipos_microciclos" 
ON public.tipos_microciclos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tipos_microciclos" 
ON public.tipos_microciclos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tipos_microciclos" 
ON public.tipos_microciclos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for microcycle configurations (replaces periodizacoes_semana_config concept)
CREATE TABLE public.tipos_microciclos_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_microciclo_id UUID NOT NULL REFERENCES public.tipos_microciclos(id) ON DELETE CASCADE,
  tipo_serie tipo_serie NOT NULL,
  rep_min INTEGER NOT NULL,
  rep_max INTEGER NOT NULL,
  descanso_min INTEGER NOT NULL,
  descanso_max INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipos_microciclos_config ENABLE ROW LEVEL SECURITY;

-- Create policies for tipos_microciclos_config
CREATE POLICY "Users can view tipos_microciclos_config of their tipos" 
ON public.tipos_microciclos_config 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tipos_microciclos 
  WHERE tipos_microciclos.id = tipos_microciclos_config.tipo_microciclo_id 
  AND tipos_microciclos.user_id = auth.uid()
));

CREATE POLICY "Users can create tipos_microciclos_config for their tipos" 
ON public.tipos_microciclos_config 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tipos_microciclos 
  WHERE tipos_microciclos.id = tipos_microciclos_config.tipo_microciclo_id 
  AND tipos_microciclos.user_id = auth.uid()
));

CREATE POLICY "Users can update tipos_microciclos_config of their tipos" 
ON public.tipos_microciclos_config 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.tipos_microciclos 
  WHERE tipos_microciclos.id = tipos_microciclos_config.tipo_microciclo_id 
  AND tipos_microciclos.user_id = auth.uid()
));

CREATE POLICY "Users can delete tipos_microciclos_config of their tipos" 
ON public.tipos_microciclos_config 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.tipos_microciclos 
  WHERE tipos_microciclos.id = tipos_microciclos_config.tipo_microciclo_id 
  AND tipos_microciclos.user_id = auth.uid()
));

-- Update periodizacoes_semanas to reference microcycle types instead of storing config directly
ALTER TABLE public.periodizacoes_semanas 
ADD COLUMN tipo_microciclo_id UUID REFERENCES public.tipos_microciclos(id);

-- Update periodizacoes_semanas to remove the old tipo_semana field since now it comes from the referenced type
ALTER TABLE public.periodizacoes_semanas 
DROP COLUMN tipo_semana;

-- Add ordem field to periodizacoes_semanas for ordering
ALTER TABLE public.periodizacoes_semanas 
ADD COLUMN ordem INTEGER NOT NULL DEFAULT 1;

-- Create function to update timestamps for tipos_microciclos
CREATE OR REPLACE FUNCTION public.update_tipos_microciclos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on tipos_microciclos
CREATE TRIGGER update_tipos_microciclos_updated_at
BEFORE UPDATE ON public.tipos_microciclos
FOR EACH ROW
EXECUTE FUNCTION public.update_tipos_microciclos_updated_at();