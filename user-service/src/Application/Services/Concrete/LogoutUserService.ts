import {UserSessionDTO} from "../../DTO/ToCommand/UserSessionDTO.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {BaseService} from "../Interfaces/BaseService.js";
import {UserSessionCommand} from "../../../Domain/Command/CommandObject/UserSessionCommand.js";
import {LogoutSessionCommandHandler} from "../../../Domain/Command/Handlers/LogoutSessionCommandHandler.js";
import {LogoutSessionCommandValidator} from "../../../Domain/Command/Validators/LogoutSessionCommandValidator.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import { Result } from "../../../Shared/Utils/Result.js";
import {FastifyRequest} from "fastify";
import {TokenBlacklistService} from "./Redis/TokenBlacklistService.js";
import {ErrorTypeEnum} from "../../Enums/ErrorTypeEnum.js";

export class LogoutUserService implements BaseService<UserSessionDTO>
{
    private readonly UserRepository: UserRepository;
    private readonly LogoutUserHandler: LogoutSessionCommandHandler;
    private readonly LogoutUserValidator: LogoutSessionCommandValidator;

    constructor(userRepository: UserRepository, notification: NotificationError)
    {
        this.UserRepository = userRepository;
        this.LogoutUserValidator = new LogoutSessionCommandValidator(this.UserRepository, notification);
        this.LogoutUserHandler = new LogoutSessionCommandHandler(this.UserRepository);
    }

    public async Logout(dto: UserSessionDTO, request: FastifyRequest): Promise<Result<void>>
    {
        try
        {
            const token = request.cookies.token;

            if (token)
                await TokenBlacklistService.blacklistToken(token, 3600);

            const command: UserSessionCommand = UserSessionCommand.FromDTO(dto);
            await this.LogoutUserValidator.Validator(command);
            await this.LogoutUserHandler.Handle(command);

            return Result.Success("User logged out successfully");
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof  PrismaClientKnownRequestError)
            {
                if (error.code === 'P2002')
                    return Result.Failure(ErrorCatalog.UsernameAlreadyExists.SetError(), ErrorTypeEnum.VALIDATION);

                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    Execute(dto: UserSessionDTO): Promise<Result<void>>
    {
        throw new Error("Method not implemented.");
    }
}