import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API iniciada em http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`Recebido ${signal}. Encerrando servidor...`);
  server.close(async (err) => {
    if (err) {
      logger.error({ err }, 'Erro ao encerrar servidor HTTP');
    }
    try {
      await prisma.$disconnect();
      logger.info('Conexão com MySQL encerrada.');
    } catch (disconnectErr) {
      logger.error({ err: disconnectErr }, 'Erro ao desconectar do MySQL');
    }
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
