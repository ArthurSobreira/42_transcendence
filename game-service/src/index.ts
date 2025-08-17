import https from 'https';
import fs from 'fs';
import path from 'path';
import helmet from "@fastify/helmet";
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import {fastifyCors} from "@fastify/cors";

import prisma from "./Infrastructure/Service/PrismaService";
import { TournamentRoutes } from "./Presentation/Routes/TournamentRoutes/TournamentRoutes";
import { TournamentController } from "./Presentation/Controllers/TournamentController";
import { HistoryController } from "./Presentation/Controllers/HistoryController";
import { HistoryRoutes } from "./Presentation/Routes/HistoryRoutes/HistoryRoutes";
import { MatchmakingController } from "./Presentation/Controllers/MatchmakingController";
import { MatchmakingRoutes } from "./Presentation/Routes/MatchmakingRoutes/MatchmakingRoutes";
import { setupWebSocket } from './game/websockets';

async function main() {

    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.key')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.pem')),
    };

    const server = fastify({
        https: httpsOptions
    });


    server.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || ''
    });

    server.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://accounts.google.com"],
                frameSrc: ["'self'", "https://accounts.google.com"],
                connectSrc: ["'self'", "https://accounts.google.com", "wss://localhost:3001"]
            }
        }
    });

    server.register(fastifyCors, {
        origin: "https://localhost:8443",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    });

    const tournamentController = new TournamentController();
    const historyController = new HistoryController();
    const matchmakingController = new MatchmakingController();

    await TournamentRoutes(server, tournamentController);
    await HistoryRoutes(server, historyController);
    await MatchmakingRoutes(server, matchmakingController);

    server.setErrorHandler((async (error: any, request: any, reply: any) => {
        console.log("Error: ", error);
    }));

    setupWebSocket(server);

    try {
        const address = await server.listen({ port: 3001, host: '0.0.0.0' });
        console.log(`HTTPS and WSS Server listening on ${address}`);
    } catch (err) {
        console.log("Failed to start server: ", err, "");
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();