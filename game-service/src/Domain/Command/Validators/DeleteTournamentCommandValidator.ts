import {BaseValidator} from "./BaseValidator";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog";
import {DeleteTournamentCommand} from "../CommandObject/DeleteTournamentCommand";

export class DeleteTournamentCommandValidator implements BaseValidator<DeleteTournamentCommand>
{
    constructor(private tournamentRepository: TournamentRepository, private NotificationError: NotificationError)
    {
    }

    public async Validator(command: DeleteTournamentCommand)
    {
        if (!await this.tournamentRepository.VerifyIfTournamentExistsByUUID(command.tournamentUuid))
            this.NotificationError.AddError(ErrorCatalog.TournamentNotFound);
    }
}