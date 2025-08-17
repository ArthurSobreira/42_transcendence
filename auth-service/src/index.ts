import fastify, { FastifyInstance } from 'fastify';
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

const server: FastifyInstance = fastify();
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
  console.log(server.printRoutes());
});

server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    if (!authOptions.GOOGLE_CLIENT_ID || !authOptions.JWT_SECRET) {
      throw new Error('Missing GOOGLE_CLIENT_ID or JWT_SECRET in .env file');
    }

    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Authentication service is running on port 3000');
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
