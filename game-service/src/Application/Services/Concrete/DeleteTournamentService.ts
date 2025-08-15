import {FastifyReply} from "fastify";
import {BaseService} from "../Interfaces/BaseService.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository.js";
import {DeleteTournamentCommandValidator} from "../../../Domain/Command/Validators/DeleteTournamentCommandValidator";
import {DeleteTournamentCommandHandler} from "../../../Domain/Command/Handlers/DeleteTournamentCommandHandler.js";
import {Result} from "../../../Shared/Utils/Result.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {Prisma} from "@prisma/client";
import {DeleteTournamentCommand} from "../../../Domain/Command/CommandObject/DeleteTournamentCommand";
import {DeleteTournamentDTO} from "../../DTO/ToCommand/DeleteTournamentDTO";
import {ErrorTypeEnum} from "../../Enum/ErrorTypeEnum";

export class DeleteTournamentService implements BaseService<DeleteTournamentDTO>
{
    private tournamentRepository: TournamentRepository;
    private deleteTournamentHandler: DeleteTournamentCommandHandler;
    private deleteUserCommandValidator: DeleteTournamentCommandValidator;

    constructor(notificationError: NotificationError)
    {
        this.tournamentRepository = new TournamentRepository();
        this.deleteUserCommandValidator = new DeleteTournamentCommandValidator(this.tournamentRepository, notificationError);
        this.deleteTournamentHandler = new DeleteTournamentCommandHandler(this.tournamentRepository, notificationError);
    }

    public async Execute(dto: DeleteTournamentDTO, reply: FastifyReply): Promise<Result>
    {
        try
        {
            const command: DeleteTournamentCommand = DeleteTournamentCommand.fromDTO(dto);
            await this.deleteUserCommandValidator.Validator(command);
            await this.deleteTournamentHandler.Handle(command);

            return Result.Success("User deleted successfully");
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
                if (error.code === 'P2025')
                    return Result.Failure("User to be deleted not found.");

                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }

            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }
}
