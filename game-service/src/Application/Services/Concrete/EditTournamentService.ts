import {FastifyReply} from "fastify";
import {BaseService} from "../Interfaces/BaseService.js";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {EditTournamentCommandHandler} from "../../../Domain/Command/Handlers/EditTournamentCommandHandler.js";
import {EditTournamentCommandValidator} from "../../../Domain/Command/Validators/EditTournamentCommandValidator.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {Result} from "../../../Shared/Utils/Result.js";
import {EditTournamentDTO} from "../../DTO/ToCommand/EditTournamentDTO";
import {EditTournamentCommand} from "../../../Domain/Command/CommandObject/EditTournamentCommand";
import {ErrorTypeEnum} from "../../Enum/ErrorTypeEnum";

export class EditTournamentService implements BaseService<EditTournamentDTO>
{
    private tournamentRepository: TournamentRepository;
    private editTournamentHandler: EditTournamentCommandHandler;
    private editTournamentValidator: EditTournamentCommandValidator;

    constructor(notificationError: NotificationError)
    {
        this.tournamentRepository = new TournamentRepository();
        this.editTournamentValidator = new EditTournamentCommandValidator(this.tournamentRepository, notificationError);
        this.editTournamentHandler = new EditTournamentCommandHandler(this.tournamentRepository, notificationError);
    }

    public async Execute(dto: EditTournamentDTO, reply: FastifyReply) : Promise<Result<void>>
    {
        try
        {
            const command: EditTournamentCommand = EditTournamentCommand.fromDTO(dto);
            await this.editTournamentValidator.Validator(command);
            await this.editTournamentHandler.Handle(command);

            return Result.Success("Tournament edited successfully");
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
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError(), ErrorTypeEnum.CONFLICT);
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError(), ErrorTypeEnum.INTERNAL);
        }
    }
}