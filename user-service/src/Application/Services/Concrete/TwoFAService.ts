import {BaseService} from "../Interfaces/BaseService.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {Result} from "../../../Shared/Utils/Result.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {ErrorTypeEnum} from "../../Enums/ErrorTypeEnum.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {Generate2FaQueryHandler} from "../../../Domain/Queries/Handlers/Generate2FaQueryHandler.js";
import {Generate2FaQueryValidator} from "../../../Domain/Queries/Validators/Generate2FaQueryValidator.js";
import {EnableTwoFaCommandValidator} from "../../../Domain/Command/Validators/EnableTwoFaCommandValidator.js";
import {EnableTwoFaCommandHandler} from "../../../Domain/Command/Handlers/EnableTwoFaCommandHandler.js";
import {DisableTwoFaCommandHandler} from "../../../Domain/Command/Handlers/DisableTwoFaCommandHandler.js";
import {EnableTwoFaDTO} from "../../DTO/ToCommand/EnableTwoFaDTO.js";
import {EnableTwoFaCommand} from "../../../Domain/Command/CommandObject/EnableTwoFaCommand.js";
import {DisableTwoFaCommand} from "../../../Domain/Command/CommandObject/DisableTwoFaCommand.js";
import {DisableTwoFaDTO} from "../../DTO/ToCommand/DisableTwoFaDTO.js";
import {FastifyReply, FastifyRequest} from "fastify";
import {Prisma} from "@prisma/client";
import {Generate2FaViewModel} from "../../ViewModels/Generate2FaViewModel.js";
import {Generate2FaQuery} from "../../../Domain/Queries/QueryObject/Generate2FaQuery.js";
import {Generate2FaQueryDTO} from "../../../Domain/QueryDTO/Generate2FaQueryDTO.js";
import {Verify2faDTO} from "../../DTO/ToQuery/Verify2faDTO.js";
import {Verify2FaQueryValidator} from "../../../Domain/Queries/Validators/Verify2FaQueryValidator.js";
import {Verify2faQuery} from "../../../Domain/Queries/QueryObject/Verify2faQuery.js";
import {Verify2FaQueryHandler} from "../../../Domain/Queries/Handlers/Verify2FaQueryHandler.js";

export class TwoFAService implements BaseService<any, boolean>
{
    private EnableTwoFaHandler: EnableTwoFaCommandHandler;
    private EnableTwoFaValidator: EnableTwoFaCommandValidator
    private DisableTwoFaHandler: DisableTwoFaCommandHandler;
    private DisableTwoFaValidator: EnableTwoFaCommandValidator;
    private Generate2FaHandler: Generate2FaQueryHandler;
    private Generate2FaValidator: Generate2FaQueryValidator
    private Verify2FaHandler: Verify2FaQueryHandler;
    private Verify2FaValidator: Verify2FaQueryValidator;

    constructor(private userRepository: UserRepository, request: FastifyRequest <{ Querystring: Verify2faQuery }>,
                reply: FastifyReply, notificationError: NotificationError)
    {
        this.EnableTwoFaHandler = new EnableTwoFaCommandHandler(userRepository, notificationError);
        this.EnableTwoFaValidator = new EnableTwoFaCommandValidator(userRepository, notificationError);
        this.DisableTwoFaHandler = new DisableTwoFaCommandHandler(userRepository, notificationError);
        this.DisableTwoFaValidator = new EnableTwoFaCommandValidator(userRepository, notificationError);
        this.Generate2FaHandler = new Generate2FaQueryHandler(userRepository, notificationError);
        this.Generate2FaValidator = new Generate2FaQueryValidator(userRepository, notificationError);
        this.Verify2FaValidator = new Verify2FaQueryValidator(userRepository, notificationError);
        this.Verify2FaHandler = new Verify2FaQueryHandler(userRepository, request, reply, notificationError);
    }

    Execute(dto: any, reply: any): Promise<Result<boolean>> {
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

    public async Generate2FaSetup(uuid: string, reply: FastifyReply): Promise<Result<Generate2FaViewModel | null>>
    {
        try
        {
            let generateSetupViewModel: Generate2FaViewModel | null = null;
            var query: Generate2FaQuery = Generate2FaQuery.fromDTO(uuid);

            await this.Generate2FaValidator.Validator(query);
            const generateSetupQueryDTO: Generate2FaQueryDTO | null = await this.Generate2FaHandler.Handle(query);

            if (!generateSetupQueryDTO)
                return Result.SuccessWithData<Generate2FaViewModel | null>("Unable to generate 2FA setup, user not found", generateSetupViewModel);

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

    public async Verify2FaCode(dto: Verify2faDTO, request: FastifyRequest <{ Querystring: Verify2faQuery }>, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            var query: Verify2faQuery = Verify2faQuery.fromDTO(dto);

            await this.Verify2FaValidator.Validator(query);
            const result = await this.Verify2FaHandler.Handle(query);

            if (!result)
                return Result.SuccessWithData<boolean>("Error: 2fa isn't unable for this user", false);

            return Result.SuccessWithData<boolean>("2fa verified successfully", true);
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