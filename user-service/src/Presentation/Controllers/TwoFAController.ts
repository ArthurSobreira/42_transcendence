import {BaseController} from "./BaseController.js";
import {NotificationError} from "../../Shared/Errors/NotificationError.js";

export class TwoFAController extends BaseController
{
    private readonly notificationError: NotificationError;
    private readonly userRepository: UserRepository;
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
        const twoFaDTO: EnableTwoFaDTO = new EnableTwoFaDTO(body.secret, body.recoveryCode);
        const result: Result = await this.twoFaService.EnableTwoFa(twoFaDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async DisableTwoFA(request: FastifyRequest<{ Body: DisableTwoFaDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const twoFaDTO: DisableTwoFaDTO = new DisableTwoFaDTO(body.uuid);
        const result: Result = await this.twoFaService.DisableTwoFa(twoFaDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async Generate2FaSetup(request: FastifyRequest<{ Body: { uuid: string } }>, reply: FastifyReply)
    {
        const body = request.body;
        const result: Result = await this.twoFaService.Generate2FaSetup(body.uuid, reply);
        return this.handleResult(result, reply, this.notificationError);
    }
}