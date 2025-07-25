import {BaseService} from "../Interfaces/BaseService";
import {HistoryRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/HistoryRepository";
import {CreateHistoryCommandHandler} from "../../../Domain/Command/Handlers/CreateHistoryCommandHandler";
import {CreateHistoryValidator} from "../../../Domain/Command/Validators/CreateHistoryValidator";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {CreateHistoryDTO} from "../../DTO/ToCommand/CreateHistoryDTO";
import {FastifyReply} from "fastify";
import { Result } from "../../../Shared/Utils/Result";
import {CreateHistoryCommand} from "../../../Domain/Command/CommandObject/CreateHistoryCommand";
import {ValidationException} from "../../../Shared/Errors/ValidationException";
import {Prisma} from "@prisma/client";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog";
import {GetAllTournamentsViewModel} from "../../ViewModel/GetAllTournamentsViewModel";
import {GetAllHistoriesDTO} from "../../DTO/ToQuery/GetAllHistoriesDTO";
import {GetAllHistoriesQuery} from "../../../Domain/Queries/QueryObject/GetAllHistoriesQuery";
import {GetAllHistoriesViewModel} from "../../ViewModel/GetAllHistoriesViewModel";
import {GetAllHistoriesQueryDTO} from "../../../Domain/QueryDTO/GetAllHistoriesQueryDTO";
import {GetAllHistoriesQueryHandler} from "../../../Domain/Queries/Handlers/GetAllHistoriesQueryHandler";

export class HistoryService implements BaseService<any>
{
    private readonly historyRepository: HistoryRepository;
    private readonly createHistoryCommandHandler: CreateHistoryCommandHandler;
    private readonly createHistoryCommandValidator: CreateHistoryValidator;
    private readonly getAllHistoriesQueryHandler: GetAllHistoriesQueryHandler

    constructor(notificationError: NotificationError)
    {
        this.historyRepository = new HistoryRepository();
        this.createHistoryCommandValidator = new CreateHistoryValidator(notificationError);
        this.createHistoryCommandHandler = new CreateHistoryCommandHandler(this.historyRepository, notificationError);
        this.getAllHistoriesQueryHandler = new GetAllHistoriesQueryHandler(this.historyRepository, notificationError);
    }

    public async Create(dto: CreateHistoryDTO, reply: FastifyReply): Promise<Result>
    {
        try
        {
            const command: CreateHistoryCommand = CreateHistoryCommand.fromDTO(dto);
            await this.createHistoryCommandValidator.Validator(command);
            await this.createHistoryCommandHandler.Handle(command);

            return Result.Sucess("History created successfully");
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure(message);
            }

            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError());
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError());
        }
    }

    public async GetAll(dto: GetAllHistoriesDTO, reply: FastifyReply): Promise<Result<GetAllHistoriesViewModel[]>>
    {
        try
        {
            const query: GetAllHistoriesQuery = GetAllHistoriesQuery.fromDTO(dto);
            const GetAllHistoriesQueryDTO: GetAllHistoriesQueryDTO[] | null = await this.getAllHistoriesQueryHandler.Handle(query);

            if (!GetAllHistoriesQueryDTO) {
                return Result.Failure<GetAllHistoriesViewModel[]>(ErrorCatalog.HistoryNotFound.SetError());
            }

            const getAllHistoriesViewModel = GetAllHistoriesViewModel.fromQueryDTOList(GetAllHistoriesQueryDTO);
            return Result.SucessWithData<GetAllHistoriesViewModel[]>("Histories found", getAllHistoriesViewModel);
        }
        catch (error)
        {
            if (error instanceof ValidationException)
            {
                const message: string = error.SetErrors();
                return Result.Failure<GetAllHistoriesViewModel[]>(message);
            }
            else if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                return Result.Failure(ErrorCatalog.DatabaseViolated.SetError());
            }
            return Result.Failure(ErrorCatalog.InternalServerError.SetError());
        }
    }


    Execute(dto: any, reply: FastifyReply): Promise<Result<void>> {
        throw new Error("Method not implemented.");
    }
}