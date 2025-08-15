import {BaseHandlerCommand} from "./BaseHandlerCommand";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {CreateTournamentCommand} from "../CommandObject/CreateTournamentCommand";
import {Tournament} from "../../Entities/Concrete/Tournament";

export class CreateTournamentCommandHandler implements BaseHandlerCommand<CreateTournamentCommand>
{
    private tournamentRepository: TournamentRepository;

    constructor(tournamentRepository: TournamentRepository, notification: NotificationError) {
        this.tournamentRepository = tournamentRepository;
    }

    async Handle(command: CreateTournamentCommand) : Promise<void>
    {
        const tournamentEntity: Tournament = new Tournament(
            command.tournamentName,
            command.player1Uuid,
            command.player2Uuid,
            command.player3Uuid,
            command.player4Uuid,
            command.aliasPlayer1,
            command.aliasPlayer2,
            command.aliasPlayer3,
            command.aliasPlayer4,
        );

        await this.tournamentRepository.Create(tournamentEntity);
    }
}