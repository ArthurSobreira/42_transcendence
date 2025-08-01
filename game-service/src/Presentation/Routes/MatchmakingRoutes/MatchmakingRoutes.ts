import {authenticateJWT} from "../../Middleware/AuthMiddleware";
import {FastifyReply, FastifyRequest} from "fastify";
import {GenerateMatchmakingDTO} from "../../../Application/DTO/ToCommand/GenerateMatchmakingDTO";
import {MatchmakingController} from "../../Controllers/MatchmakingController";

const opts = {
    schema: {
        Querystring: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                wins: { type: 'number' },
                totalGames: { type: 'number' },
            },
            required: ['username', 'wins', 'totalGames'],
            additionalProperties: false,
        }
    }
}

export const MatchmakingRoutes = async (server: any, matchmakingController: MatchmakingController) =>
{
    server.get('/matchmaking', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Querystring: GenerateMatchmakingDTO }>, reply: FastifyReply) => {
        return await matchmakingController.GenerateMatchmaking(request, reply);
    })
}