import {BaseHandlerQuery} from "./BaseHandlerQuery.js";
import {Verify2faQuery} from "../QueryObject/Verify2faQuery.js";
import {LoginUserViewModel} from "../../../Application/ViewModels/LoginUserViewModel.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {FastifyReply, FastifyRequest} from "fastify";
import {Verify2faDTO} from "../../../Application/DTO/ToQuery/Verify2faDTO.js";

export class Verify2FaQueryHandler implements BaseHandlerQuery<Verify2faQuery, LoginUserViewModel>
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(query: Verify2faQuery, request: FastifyRequest<{ Querystring: Verify2faDTO }>, reply: FastifyReply): Promise<LoginUserViewModel>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(query.uuid);

        const token = reply.server.jwt.sign({
            uuid: user?.Uuid,
            username: user?.Username,
            isAuthenticated: true,
        }, { expiresIn: '1d' });

        reply.setCookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
        });

        return new LoginUserViewModel(token, user!.Uuid, user?.Username, user!.ProfilePic);
    }
}