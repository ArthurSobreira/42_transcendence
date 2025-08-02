import {BaseHandlerQuery} from "./BaseHandlerQuery.js";
import {Verify2faQuery} from "../QueryObject/Verify2faQuery.js";
import {LoginUserViewModel} from "../../../Application/ViewModels/LoginUserViewModel.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {FastifyReply, FastifyRequest} from "fastify";

export class Verify2FaQueryHandler implements BaseHandlerQuery<Verify2faQuery, LoginUserViewModel>
{
    private readonly request: FastifyRequest;
    private readonly reply: FastifyReply;

    constructor(private UserRepository: UserRepository, request: FastifyRequest <{ Querystring: Verify2faQuery }>,
                reply: FastifyReply, notificationError: NotificationError)
    {
        this.request = request;
        this.reply = reply;
    }

    async Handle(query: Verify2faQuery): Promise<LoginUserViewModel>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(query.uuid);

        const token = this.request.server.jwt.sign({
            email: user!.Email.getEmail(),
            isAuthenticated: true,
        }, { expiresIn: '1d' });

        this.reply.setCookie('token', token, {
            httpOnly: true, // TODO: verificar se isso muda no ultimo merge
            secure: true,
            sameSite: 'lax',
            path: '/'
        });

        return new LoginUserViewModel(token, user!.Uuid, user?.Username, user!.ProfilePic);
    }
}