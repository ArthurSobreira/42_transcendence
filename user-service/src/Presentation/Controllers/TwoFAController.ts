import {BaseController} from "./BaseController.js";
import {NotificationError} from "../../Shared/Errors/NotificationError.js";
import {FastifyReply, FastifyRequest } from "fastify";
import { TwoFAService } from "src/Application/Services/Concrete/TwoFAService.js";
import { UserRepository } from "src/Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import { EnableTwoFaDTO } from "src/Application/DTO/ToCommand/EnableTwoFaDTO.js";
import { Result } from "src/Shared/Utils/Result.js";
import {DisableTwoFaDTO} from "../../Application/DTO/ToCommand/DisableTwoFaDTO.js";
import {Generate2FaViewModel} from "../../Application/ViewModels/Generate2FaViewModel.js";
import {Verify2faDTO} from "../../Application/DTO/ToQuery/Verify2faDTO.js";
import {LoginUserViewModel} from "../../Application/ViewModels/LoginUserViewModel.js";

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
        const result: Result<boolean> = await this.twoFaService.EnableTwoFa(twoFaDTO);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async DisableTwoFA(request: FastifyRequest<{ Body: DisableTwoFaDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const twoFaDTO: DisableTwoFaDTO = new DisableTwoFaDTO(body.uuid, body.code);
        const result: Result<boolean> = await this.twoFaService.DisableTwoFa(twoFaDTO);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async Generate2FaQrcode(request: FastifyRequest<{ Body: { uuid: string } }>, reply: FastifyReply)
    {
        const body = request.body;
        const result: Result<Generate2FaViewModel | null> = await this.twoFaService.Generate2FaQrcode(body.uuid);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async Verify2FA(request: FastifyRequest<{ Querystring: Verify2faDTO }>, reply: FastifyReply)
    {
        const query = request.query;
        const verify2FaDTO: Verify2faDTO = new Verify2faDTO(query.uuid, query.code);
        const result: Result<LoginUserViewModel> = await this.twoFaService.Verify2FaCode(verify2FaDTO);
        return this.handleResult(result, reply, this.notificationError);
    }
}