import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectMongo, disconnectMongo } from './config/mongo';
import { prisma } from './config/prisma';

async function bootstrap(): Promise<void> {
  await connectMongo();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API iniciada em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
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
      try {
        await disconnectMongo();
        logger.info('Conexão com MongoDB encerrada.');
      } catch (disconnectErr) {
        logger.error({ err: disconnectErr }, 'Erro ao desconectar do MongoDB');
      }
      process.exit(err ? 1 : 0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Falha ao iniciar a aplicação');
  process.exit(1);
});
