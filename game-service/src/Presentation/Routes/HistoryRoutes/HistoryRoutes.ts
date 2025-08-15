import {FastifyReply, FastifyRequest} from "fastify";
import {authenticateJWT} from "../../Middleware/AuthMiddleware";
import {CreateHistoryDTO} from "../../../Application/DTO/ToCommand/CreateHistoryDTO";
import {HistoryController} from "../../Controllers/HistoryController";
import {GetAllHistoriesDTO} from "../../../Application/DTO/ToQuery/GetAllHistoriesDTO";

export const HistoryRoutes = async (server: any, historyController: HistoryController) =>
{
    server.post('/history', async (request: FastifyRequest<{ Body: CreateHistoryDTO }>, reply: FastifyReply) =>{
        return await historyController.CreateHistory(request, reply);
    });

    server.get('/history', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Querystring: GetAllHistoriesDTO }>, reply: FastifyReply) =>{
        return await historyController.GetAllHistories(request, reply);
    });

    server.get('/test', { preHandler: authenticateJWT }, async (request: FastifyRequest, reply: FastifyReply) => {
        if( request.user) {
            console.log('Authenticated user:', request.user);
            return reply.send({ message: 'Test route accessed successfully', user: request.user });
        }
        console.log('No authenticated user found in request');
        return reply.status(401).send({ message: 'Unauthorized: No user found' });
    });
};