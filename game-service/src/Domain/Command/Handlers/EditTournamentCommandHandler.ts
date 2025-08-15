import {BaseHandlerCommand} from "./BaseHandlerCommand";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {EditTournamentCommand} from "../CommandObject/EditTournamentCommand";
import {Tournament} from "../../Entities/Concrete/Tournament";

export class EditTournamentCommandHandler implements BaseHandlerCommand<EditTournamentCommand>
{
    constructor(private tournamentRepository: TournamentRepository, Notifcation: NotificationError)
    {
    }

    async Handle(command: EditTournamentCommand): Promise<void>
    {
        const tournament: Tournament | null = await this.tournamentRepository.GetTournamentEntityByUuid(command.tournamentUuid);

        await this.ChangeFields(tournament!, command);

        await this.tournamentRepository.Update(command.tournamentUuid, tournament);
    }

    private async ChangeFields(tournament: Tournament, command: EditTournamentCommand): Promise<void>
    {
       tournament.tournamentName = command.tournamentName;
       tournament.player1Uuid = command.player1Uuid;
       tournament.player2Uuid = command.player2Uuid;
       tournament.player3Uuid = command.player3Uuid;
       tournament.player4Uuid = command.player4Uuid;
    }
}