import {BaseController} from "./BaseController";
import {NotificationError} from "../../Shared/Errors/NotificationError";
import {FastifyReply, FastifyRequest} from "fastify";
import { Result } from "../../Shared/Utils/Result.js";
import {CreateTournamentDTO} from "../../Application/DTO/ToCommand/CreateTournamentDTO";
import {EditTournamentDTO} from "../../Application/DTO/ToCommand/EditTournamentDTO";
import {GetTournamentDTO} from "../../Application/DTO/ToQuery/GetTournamentDTO";
import {DeleteTournamentDTO} from "../../Application/DTO/ToCommand/DeleteTournamentDTO";
import {CreateTournamentService} from "../../Application/Services/Concrete/CreateTournamentService";
import {EditTournamentService} from "../../Application/Services/Concrete/EditTournamentService";
import {DeleteTournamentService} from "../../Application/Services/Concrete/DeleteTournamentService";
import {GetTournamentService} from "../../Application/Services/Concrete/GetTournamentService";
import {GetAllTournamentsDTO} from "../../Application/DTO/ToQuery/GetAllTournamentsDTO";
import {GetAllTournamentService} from "../../Application/Services/Concrete/GetAllTournamentService";
import {GetAllTournamentsViewModel} from "../../Application/ViewModel/GetAllTournamentsViewModel";
import {GetTournamentViewModel} from "../../Application/ViewModel/GetTournamentViewModel";

export class TournamentController extends BaseController
{
    private readonly notificationError: NotificationError;
    private readonly createTournament: CreateTournamentService;
    private readonly editTournament: EditTournamentService;
    private readonly deleteTournament: DeleteTournamentService;
    private readonly getTournament: GetTournamentService;
    private readonly getAllTournament: GetAllTournamentService;

    constructor()
    {
        super();
        this.notificationError = new NotificationError();
        this.createTournament = new CreateTournamentService(this.notificationError);
        this.editTournament = new EditTournamentService(this.notificationError);
        this.deleteTournament = new DeleteTournamentService(this.notificationError);
        this.getTournament = new GetTournamentService(this.notificationError);
        this.getAllTournament = new GetAllTournamentService(this.notificationError);
    }

    public async CreateTournament(request: FastifyRequest<{ Body: CreateTournamentDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const createTournamentDTO: CreateTournamentDTO = new CreateTournamentDTO(body.tournamentName, body.player1Uuid, body.player2Uuid, body.player3Uuid, body.player4Uuid,
            body.aliasPlayer1, body.aliasPlayer2, body.aliasPlayer3, body.aliasPlayer4);
        const result = await this.createTournament.Execute(createTournamentDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async EditTournament(request: FastifyRequest<{ Body: EditTournamentDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const editTournamentDTO: EditTournamentDTO = new EditTournamentDTO(body.tournamentUuid, body.tournamentName, body.player1Uuid, body.player2Uuid, body.player3Uuid, body.player4Uuid);
        const result: Result = await this.editTournament.Execute(editTournamentDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async GetTournament(request: FastifyRequest<{ Querystring: GetTournamentDTO }>, reply: FastifyReply)
    {
        const query = request.query;
        const getTournamentDTO: GetTournamentDTO = new GetTournamentDTO(query.tournamentUuid);
        const result: Result<GetTournamentViewModel | null> = await this.getTournament.Get(getTournamentDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async DeleteTournament(request: FastifyRequest<{ Body: DeleteTournamentDTO }>, reply: FastifyReply)
    {
        const body = request.body;
        const deleteTournamentDTO: DeleteTournamentDTO = new DeleteTournamentDTO(body.torunamentUuid);
        const result: Result = await this.deleteTournament.Execute(deleteTournamentDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }

    public async GetAllTournaments(request: FastifyRequest<{ Querystring: GetAllTournamentsDTO }>, reply: FastifyReply)
    {
        const query = request.query;
        const getAllTournamentsDTO: GetAllTournamentsDTO = new GetAllTournamentsDTO(query.userUuid);
        const result: Result<GetAllTournamentsViewModel[]> = await this.getAllTournament.Execute(getAllTournamentsDTO, reply);
        return this.handleResult(result, reply, this.notificationError);
    }
}