-- Adiciona a coluna data_fechamento na tabela lotes
ALTER TABLE lotes
ADD COLUMN IF NOT EXISTS data_fechamento date;
