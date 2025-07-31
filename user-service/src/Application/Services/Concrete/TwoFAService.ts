import {BaseService} from "../Interfaces/BaseService.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {Result} from "../../../Shared/Utils/Result.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {ErrorTypeEnum} from "../../Enums/ErrorTypeEnum.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {Generate2FaQueryHandler} from "../../../Domain/Queries/Handlers/Generate2FaQueryHandler.js";
import {Generate2FaQueryValidator} from "../../../Domain/Queries/Validators/Generate2FaQueryValidator.js";

export class TwoFAService implements BaseService<any, boolean>
{
    private Generate2FaHandler: Generate2FaQueryHandler;
    private Generate2FaValidator: Generate2FaQueryValidator
    constructor(private userRepository: UserRepository, notificationError: NotificationError)
    {

    }

    Execute(dto: any, reply): Promise<Result<boolean>> {
        throw new Error("Method not implemented.");
    }

    public async EnableTwoFa(dto: EnableTwoFaDTO, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            const command: EnableTwoFaCommand = EnableTwoFaCommand.fromDTO(dto);
            await this.EnableTwoFaValidator.Validator(command);
            await this.EnableTwoFaHandler.Handle(command);

            return Result.SuccessWithData<boolean>("TwoFA enabled successfully", true);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    public async DisableTwoFa(dto: DisableTwoFaDTO, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            const command: DisableTwoFaCommand = DisableTwoFaCommand.fromDTO(dto);
            await this.DisableTwoFaValidator.Validator(command);
            await this.DisableTwoFaHandler.Handle(command);

            return Result.SuccessWithData<boolean>("TwoFA disabled successfully", true);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    public async Generate2FaSetup(uuid: string, reply: FastifyReply): Promise<Result<Generate2FaViewModel>>
    {
        try
        {
            let generateSetupViewModel = Generate2FaViewModel | null = null;
            var query: Generate2FaSetupQuery = Generate2FaSetupQuery.fromDTO(uuid);
            await this.Generate2FaValidator.Validator(query);
            const generateSetupQueryDTO: Generate2FaQueryDTO = await this.Generate2FaHandler.Handle(query);

            if (!generateSetupQueryDTO)
                return Result.SuccessWithData<Generate2FaViewModel | null>("Doesn't possible to generate 2fa setup, user not found", generateSetupViewModel);

            generateSetupViewModel = Generate2FaViewModel.fromQueryDTO(generateSetupQueryDTO);
            return Result.SuccessWithData<Generate2FaViewModel>("2fa setup generated successfully", generateSetupViewModel);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }
}