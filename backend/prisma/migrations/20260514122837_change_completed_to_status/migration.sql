-- Adiciona a nova coluna `status` com default `pending`.
ALTER TABLE `tasks`
  ADD COLUMN `status` ENUM('pending', 'in_progress', 'done') NOT NULL DEFAULT 'pending';

-- Preserva o estado existente: tarefas com `completed = 1` viram `done`.
UPDATE `tasks` SET `status` = 'done' WHERE `completed` = 1;

-- Cria índice em `status` para acelerar filtros por coluna.
CREATE INDEX `tasks_status_idx` ON `tasks`(`status`);

-- Remove a coluna `completed` (substituída por `status`).
ALTER TABLE `tasks` DROP COLUMN `completed`;
