-- 1) Default provider passa a ser 'none'
ALTER TABLE public.storage_settings
  ALTER COLUMN provider SET DEFAULT 'none';

-- 2) Coluna para guardar o email Google vinculado
ALTER TABLE public.storage_settings
  ADD COLUMN IF NOT EXISTS gdrive_email text;

-- 3) Normalizar registros antigos: quem está como 'supabase' sem pasta do Drive
--    passa para 'none' (desconectado). Quem já tem 'gdrive' permanece.
UPDATE public.storage_settings
   SET provider = 'none'
 WHERE provider = 'supabase'
   AND (gdrive_root_folder_id IS NULL OR gdrive_root_folder_id = '');