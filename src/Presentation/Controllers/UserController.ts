import { CreateUserDTO } from "../../Domain/DTO/Command/CreateUserDTO.js";
import { Result } from "../../Shared/Utils/Result.js";
import { FastifyReply, FastifyRequest } from "fastify";
import {BaseController} from "./BaseController.js";
import {CreateUserService} from "../../Application/Services/Concrete/CreateUserService.js";
import {NotificationError} from "../../Shared/Errors/NotificationError.js";

export class UserController extends BaseController
{
    private readonly NotificationError: NotificationError;
    private readonly CreateUserService: CreateUserService;

    constructor()
    {
        super();
        this.NotificationError = new NotificationError();
        this.CreateUserService = new CreateUserService(this.NotificationError);
    }

    public async CreateUser(request: FastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply) : Promise<FastifyReply>
    {
        const body = request.body;
        const userDTO: CreateUserDTO = new CreateUserDTO(body.email, body.password, body.username, body.profilePic);
        const result: Result = await this.CreateUserService.Execute(userDTO, reply);

        return(this.handleResult(result, reply, this.NotificationError));
    }
}
