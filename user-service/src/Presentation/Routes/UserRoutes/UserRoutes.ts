import {FastifyReply, FastifyRequest} from "fastify";
import {CreateUserDTO} from "../../../Application/DTO/ToCommand/CreateUserDTO.js";
import {authenticateJWT} from "../../Middleware/AuthMiddleware.js";
import {EditUserDTO} from "../../../Application/DTO/ToCommand/EditUserDTO.js";
import {DeleteUserDTO} from "../../../Application/DTO/ToCommand/DeleteUserDTO.js";
import {UserController} from "../../Controllers/UserController.js";
import {UpdateStatsDTO} from "../../../Application/DTO/ToCommand/UpdateStatsDTO.js";
import {GetUserDTO} from "../../../Application/DTO/ToQuery/GetUserDTO.js";
import {UploadPhotoDTO} from "../../../Application/DTO/ToCommand/UploadPhotoDTO.js";

const opts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                username: { type: 'string' },
                profilePic: { type: ['string', 'null'] },
                lastLogin: {
                    anyOf: [
                        { type: 'string', format: 'date-time' },
                        { type: 'null' },
                    ]
                },
            },
            required: ['email', 'password', 'username'],
            additionalProperties: false,
        }
    }
}

const optsChecker = {
    schema: {
        querystring: {
            type: 'object',
            properties: {
                uuids: {type: 'array', items: {type: 'string'}},
            },
            required: ['uuids'],
            additionalProperties: false,
        }
    }
}

const optsUsernamesChecker = {
  schema: {
    querystring: {
      type: 'object',
      required: ['usernames'],
      properties: {
        usernames: { type: 'array', items: { type: 'string' } }
      }
    }
  }
};

const updateStatsOpts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                gameType: { type: 'string', enum: [ 'SINGLEPLAYER', 'MULTIPLAYER_LOCAL', 'MULTIPLAYER_REMOTO', 'TOURNAMENT', 'RPS' ] },
                player1Username: { type: 'string' },
                player1Points: { type: 'number' },
                player2Username: { type: 'string' },
                player2Points: { type: 'number' },
                player3Username: { type: ['string', 'null'] },
                player3Points: { type: ['number', 'null'] },
                player4Username: { type: ['string', 'null'] },
                player4Points: { type: ['number', 'null'] },
            },
            required: ['gameType', 'player1Username', 'player1Points', 'player2Username', 'player2Points'],
            additionalProperties: false,
        }
    }
}

export const UserRoutes = async (server: any, userController: UserController) => {
    
    server.post('/user', opts, async (request: FastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply) => {
        return await userController.CreateUser(request, reply);
    });

    server.put('/user', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Body: EditUserDTO }>, reply: FastifyReply) => {
        return await userController.EditUser(request, reply);
    });

    server.delete('/user', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Body: DeleteUserDTO }>, reply: FastifyReply) => {
        return await userController.DeleteUser(request, reply);
    });

    server.get('/user', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Querystring: GetUserDTO }>, reply: FastifyReply) => {
        return await userController.GetUser(request, reply);
    });

    server.get('/users/exists/uuids', optsChecker, async (request: FastifyRequest<{ Querystring: { uuids: (string | null)[] }}>, reply: FastifyReply) => {
        return await userController.VerifyIfUsersExistsByUuids(request, reply);
    })

    server.get('/users/exists/usernames', optsUsernamesChecker, async (request: FastifyRequest<{ Querystring: { usernames: (string | null)[] }}>, reply: FastifyReply) => {
        return await userController.VerifyIfUsersExistsByUsernames(request, reply);
    })

    server.get('/users/exists/:username', { preHandler: authenticateJWT }, async (request: FastifyRequest <{ Params: { username: string }}>, reply: FastifyReply) => {
        return await userController.VerifyIfUserExistsByUsername(request, reply);
    })

    server.get('/users/:uuid', userController.findOne.bind(userController));

    server.get('/users/me', { preHandler: authenticateJWT }, async (request: FastifyRequest, reply: FastifyReply) => {
        const userPayload = request.user as { uuid: string };

        if (!userPayload || !userPayload.uuid) {
            return reply.status(400).send({ message: "UUID do usuário inválido." });
        }

        const getUserDTO = new GetUserDTO(userPayload.uuid);

        const modifiedRequest = {
            ...request,
            query: getUserDTO
        } as FastifyRequest<{ Querystring: GetUserDTO }>;

        return await userController.GetUser(modifiedRequest, reply);
    });

    server.put('/users/me/status', { preHandler: authenticateJWT }, async (request: FastifyRequest<{ Body: { isOnline: boolean } }>, reply: FastifyReply) => {
        const userPayload = request.user as { uuid: string };
        const { isOnline } = request.body;

        if (!userPayload || !userPayload.uuid) {
            return reply.status(400).send({ message: "UUID do usuário inválido." });
        }

        return await userController.UpdateUserStatus(userPayload.uuid, isOnline, reply);
    });

    server.get('/users', { preHandler: authenticateJWT }, async (request: FastifyRequest, reply: FastifyReply) => {
        return await userController.GetAllUsers(request, reply);
    });

    server.put('/updateStats', updateStatsOpts, async (request: FastifyRequest <{ Body: UpdateStatsDTO }>,  reply: FastifyReply) => {
        return await userController.UpdateStats(request, reply);
    });

    server.put('/uploadPhoto', async (request: FastifyRequest<{ Body: UploadPhotoDTO }>, reply: FastifyReply) => {
        return await userController.UploadPhoto(request, reply);
    });
}