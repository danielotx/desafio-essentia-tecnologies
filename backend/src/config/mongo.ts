import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectMongo(): Promise<void> {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI não definida; metadados de tarefas ficarão indisponíveis.');
    return;
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('Conectado ao MongoDB.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'Erro na conexão com MongoDB');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Desconectado do MongoDB.');
  });

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export { mongoose };
