import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API iniciada em http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`Recebido ${signal}. Encerrando servidor...`);
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Erro ao encerrar servidor');
      process.exit(1);
    }
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
