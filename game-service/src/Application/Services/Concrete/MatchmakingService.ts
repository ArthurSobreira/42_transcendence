import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {GenerateMatchmakingDTO} from "../../DTO/ToCommand/GenerateMatchmakingDTO";
import {FastifyReply} from "fastify";
import {GenerateMatchmakingQuery} from "../../../Domain/Queries/QueryObject/GenerateMatchmakingQuery";
import {GenerateMatchmakingQueryHandler} from "../../../Domain/Queries/Handlers/GenerateMatchmakingQueryHandler";
import {GenerateMatchmakingQueryValidator} from "../../../Domain/Queries/Validators/GenerateMatchmakingQueryValidator";
import { UserServiceClient } from "../../../Infrastructure/Http/Concrete/UserServiceClient";
import {GetUserMatchmakingQueryDTO} from "../../../Domain/QueryDTO/GetUserMatchmakingQueryDTO";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog";
import { Result } from "../../../Shared/Utils/Result";
import {ValidationException} from "../../../Shared/Errors/ValidationException";
import {Prisma} from "@prisma/client";
import {GetUserMatchmakingViewModel} from "../../ViewModel/GetUserMatchmakingViewModel";

export class MatchmakingService
{
    private readonly backendApiClient: UserServiceClient;
    private readonly matchmakingQueryHandler: GenerateMatchmakingQueryHandler;
    private readonly matchmakingQueryValidator: GenerateMatchmakingQueryValidator;

    constructor(notificationError: NotificationError)
    {
        this.backendApiClient = new UserServiceClient();
        this.matchmakingQueryHandler = new GenerateMatchmakingQueryHandler(this.backendApiClient, notificationError);
        this.matchmakingQueryValidator = new GenerateMatchmakingQueryValidator(notificationError);
    }

    public async Generate(dto: GenerateMatchmakingDTO, reply: FastifyReply): Promise<Result<GetUserMatchmakingViewModel>>
    {
        try
        {
            const query: GenerateMatchmakingQuery = GenerateMatchmakingQuery.fromDTO(dto);
            await this.matchmakingQueryValidator.Validator(query);
            const getUserMatchmakingQueryDTO: GetUserMatchmakingQueryDTO | null = await this.matchmakingQueryHandler.Handle(query);

            if (!getUserMatchmakingQueryDTO)
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError());

            const getUserMatchmakingViewModel = GetUserMatchmakingViewModel.fromQueryDTO(getUserMatchmakingQueryDTO);
            return Result.SuccessWithData<GetUserMatchmakingViewModel>("Opponent found", getUserMatchmakingViewModel);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<GetUserMatchmakingViewModel>(message);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError());
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError());
        }
    }
}