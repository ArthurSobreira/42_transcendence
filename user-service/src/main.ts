// Exemplo para /auth-service/src/main.ts
import fastify from 'fastify';

const server = fastify({ logger: true }); // Ativar logger é bom para debug

server.get('/', async (request, reply) => {
  return { message: 'Hello from Auth Service!' };
});

const start = async () => {
  try {
    // 0.0.0.0 é essencial para o Docker
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();