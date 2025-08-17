import fastify, { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authRoutes, IAuthOptions } from './routes/authRoutes.js';
import { fastifyCors } from "@fastify/cors";

dotenv.config();

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const server: FastifyInstance = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});
// Log cada requisição recebida
server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
  server.log.info({ method: request.method, url: request.url, id: (request as any).id }, 'Requisição recebida');
});

server.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
  server.log.info({ statusCode: reply.statusCode, url: request.url, id: (request as any).id }, 'Resposta enviada');
});

server.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
  server.log.error({ err: error, url: request.url, id: (request as any).id }, 'Erro não tratado');
});
const prisma = new PrismaClient();

server.decorate('prisma', prisma);

const authOptions: IAuthOptions = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  JWT_SECRET: process.env.JWT_SECRET!,
};

server.register(authRoutes, authOptions);

server.register(fastifyCors, {
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
  credentials: true
});

server.after(() => {
  server.log.info('Rotas registradas:');
  server.log.info(server.printRoutes());
});

server.get('/health', async (request, reply) => {

  server.log.info({ url: request.url, id: (request as any).id }, 'Health check chamado');
  return { status: 'ok' };
});

const start = async () => {
  try {
    if (!authOptions.GOOGLE_CLIENT_ID || !authOptions.JWT_SECRET) {
      throw new Error('Missing GOOGLE_CLIENT_ID or JWT_SECRET in .env file');
    }

    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info('Authentication service is running na porta 3000');
    server.log.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    process.on('SIGTERM', async () => {
      server.log.info('Recebido SIGTERM, encerrando...');
      await prisma.$disconnect();
      process.exit(0);
    });
    process.on('SIGINT', async () => {
      server.log.info('Recebido SIGINT, encerrando...');
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
