import {authenticateJWT} from "../../Middleware/AuthMiddleware.js";

export const TwoFARoutes = async (server: any, twoFAController: TwoFAController) => {
    server.post('/enable2fa', { preHandler: authenticateJWT }, async (request: FastifyRequest <{ Body: EnableTwoFaDTO }>, reply: FastifyReply) => {
        return await twoFAController.EnableTwoFA(request, reply);
    });

    server.put('/disable2fa', { preHandler: authenticateJWT }, async (request: FastifyRequest <{ Body: DisableTwoFaDTO }>, reply: FastifyReply) => {
        return await twoFAController.DisableTwoFA(request, reply);
    });

    server.get('/generateSetup', { preHandler: authenticateJWT }, async (request: FastifyRequest <{ Body: { uuid: string } }>, reply: FastifyReply) => {
        return await twoFAController.Generate2FaSetup(request, reply);
    });
}