import {BaseController} from "./BaseController.js";
import {NotificationError} from "../../Shared/Errors/NotificationError.js";
import {FastifyReply, FastifyRequest } from "fastify";
import { TwoFAService } from "src/Application/Services/Concrete/TwoFAService.js";
import { UserRepository } from "src/Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import { EnableTwoFaDTO } from "src/Application/DTO/ToCommand/EnableTwoFaDTO.js";
import { Result } from "src/Shared/Utils/Result.js";
import {DisableTwoFaDTO} from "../../Application/DTO/ToCommand/DisableTwoFaDTO.js";
import {Generate2FaViewModel} from "../../Application/ViewModels/Generate2FaViewModel.js";

export class TwoFAController extends BaseController
{
    private readonly notificationError: NotificationError;
    private readonly twoFaService: TwoFAService;

    constructor (twoFaService: TwoFAService)
    {
        super();
        this.notificationError = new NotificationError();
        this.twoFaService = twoFaService;
    }

    public async EnableTwoFA(request: FastifyRequest<{ Body: EnableTwoFaDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const twoFaDTO: EnableTwoFaDTO = new EnableTwoFaDTO(body.uuid, body.secret, body.code);
        const result: Result<boolean> = await this.twoFaService.EnableTwoFa(twoFaDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async DisableTwoFA(request: FastifyRequest<{ Body: DisableTwoFaDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const twoFaDTO: DisableTwoFaDTO = new DisableTwoFaDTO(body.uuid, body.secret, body.code);
        const result: Result<boolean> = await this.twoFaService.DisableTwoFa(twoFaDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async Generate2FaSetup(request: FastifyRequest<{ Body: { uuid: string } }>, reply: FastifyReply)
    {
        const body = request.body;
        const result: Result<Generate2FaViewModel | null> = await this.twoFaService.Generate2FaSetup(body.uuid, reply);
        return this.handleResult(result, reply, this.notificationError);
    }
}