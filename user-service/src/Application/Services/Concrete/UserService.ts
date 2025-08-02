import {BaseService} from "../Interfaces/BaseService.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {FastifyReply, FastifyRequest} from "fastify";
import {Result} from "../../../Shared/Utils/Result.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {Prisma} from "@prisma/client";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {UpdateStatsCommand} from "../../../Domain/Command/CommandObject/UpdateStatsCommand.js";
import {UpdateStatsDTO} from "../../DTO/ToCommand/UpdateStatsDTO.js";
import {UpdateStatsCommandValidator} from "../../../Domain/Command/Validators/UpdateStatsCommandValidator.js";
import {UpdateStatsCommandHandler} from "../../../Domain/Command/Handlers/UpdateStatsCommandHandler.js";
import {
    VerifyIfUserExistsByUsernameQuery
} from "../../../Domain/Queries/QueryObject/VerifyIfUserExistsByUsernameQuery.js";
import {
    VerifyUserExistsByUsernameQueryHandler
} from "../../../Domain/Queries/Handlers/VerifyUserExistsByUsernameQueryHandler.js";
import {VerifyIfUserExistsByUsernameDTO} from "../../DTO/ToQuery/VerifyIfUserExistsByUsernameDTO.js";
import {
    VerifyIfUsersExistsByUsernamesQuery
} from "../../../Domain/Queries/QueryObject/VerifyIfUsersExistsByUsernamesQuery.js";
import {
    VerifyIfUsersExistsByUsernamesQueryHandler
} from "../../../Domain/Queries/Handlers/VerifyIfUsersExistsByUsernamesQueryHandler.js";
import {VerifyIfUsersExistsByUuidsQuery} from "../../../Domain/Queries/QueryObject/VerifyIfUsersExistsByUuidsQuery.js";
import {
    VerifyIfUsersExistsByUuidsQueryHandler
} from "../../../Domain/Queries/Handlers/VerifyIfUsersExistsByUuidsQueryHandler.js";
import {VerifyIfUsersExistsByUuidsDTO} from "../../DTO/ToQuery/VerifyIfUsersExistsByUuidsDTO.js";
import {ErrorTypeEnum} from "../../Enums/ErrorTypeEnum.js";
import {UploadPhotoCommand} from "../../../Domain/Command/CommandObject/UploadPhotoCommand.js";
import {UploadPhotoDTO} from "../../DTO/ToCommand/UploadPhotoDTO.js";
import {UploadPhotoCommandValidator} from "../../../Domain/Command/Validators/UploadPhotoCommandValidator.js";
import {UploadPhotoCommandHandler} from "../../../Domain/Command/Handlers/UploadPhotoCommandHandler.js";
import {UploadPhotoQueryDTO} from "../../../Domain/QueryDTO/UploadPhotoQueryDTO.js";
import {UploadPhotoViewModel} from "../../ViewModels/UploadPhotoViewModel.js";

export class UserService implements BaseService<any,  boolean>
{
    private VerifyIfUserExistsQueryHandler: VerifyIfUsersExistsByUuidsQueryHandler;
    private VerifyUsersByUsernamesQueryHandler: VerifyIfUsersExistsByUsernamesQueryHandler;
    private VerifyIfUserExistsByUsernameQueryHandler: VerifyUserExistsByUsernameQueryHandler;
    private UpdateStatsValidator: UpdateStatsCommandValidator;
    private UpdateStatsHandler: UpdateStatsCommandHandler;
    private UploadPhotoValidator: UploadPhotoCommandValidator;
    private UploadPhotoHandler: UploadPhotoCommandHandler;

    constructor(private userRepository: UserRepository, notificationError: NotificationError)
    {
        this.VerifyIfUserExistsQueryHandler = new VerifyIfUsersExistsByUuidsQueryHandler(userRepository, notificationError);
        this.VerifyUsersByUsernamesQueryHandler = new VerifyIfUsersExistsByUsernamesQueryHandler(userRepository, notificationError);
        this.VerifyIfUserExistsByUsernameQueryHandler = new VerifyUserExistsByUsernameQueryHandler(userRepository, notificationError);
        this.UpdateStatsValidator = new UpdateStatsCommandValidator(userRepository, notificationError);
        this.UpdateStatsHandler = new UpdateStatsCommandHandler(userRepository, notificationError);
        this.UploadPhotoValidator = new UploadPhotoCommandValidator(userRepository, notificationError);
        this.UploadPhotoHandler = new UploadPhotoCommandHandler(userRepository, notificationError);
    }

    Execute(dto: any, reply: FastifyReply): Promise<Result<boolean>> {
        throw new Error("Method not implemented.");
    }

    public async VerifyIfUserExistsByUuidsService(dto: VerifyIfUsersExistsByUuidsDTO, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            const query: VerifyIfUsersExistsByUuidsQuery = VerifyIfUsersExistsByUuidsQuery.FromDTO(dto);
            const exists = await this.VerifyIfUserExistsQueryHandler.Handle(query);

            if (!exists)
                return Result.Failure<boolean>("User does not exists");

            return Result.SuccessWithData<boolean>("All users exists!", exists);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<false>(message);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError());
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError());
        }
    }

    public async VerifyIfUsersExistsByUsernamesService(dto: VerifyIfUsersExistsByUsernamesQuery, notificationError: NotificationError, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            const query: VerifyIfUsersExistsByUsernamesQuery = VerifyIfUsersExistsByUsernamesQuery.FromDTO(dto);
            const exists = await this.VerifyUsersByUsernamesQueryHandler.Handle(query);

            if (!exists)
                return Result.SuccessWithData<boolean>("Users does not exists!", exists);

            return Result.SuccessWithData<boolean>("All users exists!", exists);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<false>(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    public async UpdateStatsService(dto: UpdateStatsDTO, reply: FastifyReply): Promise<Result<void>>
    {
        try
        {
            const command: UpdateStatsCommand = UpdateStatsCommand.fromDTO(dto);
            await this.UpdateStatsValidator.Validator(command);
            await this.UpdateStatsHandler.Handle(command);

            return Result.Success(`Stats from ${command.player1Username} and ${command.player2Username} updated successfully`);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                if (error.code === 'P2002') {
                    const target = error.meta?.target as string[];

                    if (target?.includes('username')) {
                        return Result.Failure(ErrorCatalog.UsernameAlreadyExists.SetError(), ErrorTypeEnum.VALIDATION);
                    }
                }
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    public async VerifyIfUserExistsByUsernameService(dto: VerifyIfUserExistsByUsernameDTO, reply: FastifyReply): Promise<Result<boolean>>
    {
        try
        {
            const query: VerifyIfUserExistsByUsernameQuery = VerifyIfUserExistsByUsernameQuery.fromQuery(dto);
            const exists = await this.VerifyIfUserExistsByUsernameQueryHandler.Handle(query)

            if (!exists)
                return Result.SuccessWithData<boolean>(`User ${query.username} does not exists`, exists);

            return Result.SuccessWithData<boolean>(`User ${query.username} exists`, exists);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<false>(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }

    public async UploadPhotoService(dto: UploadPhotoDTO, request: FastifyRequest<{ Body: UploadPhotoDTO }>): Promise<Result<UploadPhotoViewModel>>
    {
        try
        {
            const command: UploadPhotoCommand = UploadPhotoCommand.fromDTO(dto);
            await this.UploadPhotoValidator.Validator(command);
            const photoUploaded: UploadPhotoQueryDTO = await this.UploadPhotoHandler.Handle(command, request);

            const uploadPhotoViewModel: UploadPhotoViewModel = UploadPhotoViewModel.fromQueryDTO(photoUploaded);
            return Result.SuccessWithData<UploadPhotoViewModel>('Photo uploaded successfully', uploadPhotoViewModel);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<UploadPhotoViewModel>(message, ErrorTypeEnum.VALIDATION);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }
}