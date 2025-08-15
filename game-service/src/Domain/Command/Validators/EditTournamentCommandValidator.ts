import {BaseValidator} from "./BaseValidator";
import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog";
import {CustomError} from "../../../Shared/Errors/CustomError";
import {ValidationException} from "../../../Shared/Errors/ValidationException";
import {EditTournamentCommand} from "../CommandObject/EditTournamentCommand";
import {UserServiceClient} from "../../../Infrastructure/Http/Concrete/UserServiceClient";

export class EditTournamentCommandValidator implements BaseValidator<EditTournamentCommand>
{

    private backendApiClient: UserServiceClient;

    constructor(private tournamentRepository: TournamentRepository, private NotificationError: NotificationError)
    {
        this.backendApiClient = new UserServiceClient();
    }

    public async Validator(command: EditTournamentCommand): Promise<void>
    {

        if (!await this.tournamentRepository.VerifyIfTournamentExistsByUUID(command.tournamentUuid))
            this.NotificationError.AddError(ErrorCatalog.TournamentNotFound);

        await this.validateUsersExists(command);

        if (this.NotificationError.NumberOfErrors() > 0)
        {
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }

    private async validateUsersExists(command: EditTournamentCommand)
    {
        try {
            const usersList: string[] = [
                command.player1Uuid,
                command.player2Uuid,
                command.player3Uuid,
                command.player4Uuid,
            ].filter(uuid => uuid != null && uuid !== '');

            if (usersList.length < 4)
                this.NotificationError.AddError(ErrorCatalog.InvalidNumberOfParticipants);

            const exists: boolean = await this.backendApiClient.VerifyIfUsersExistsByUuids(usersList);

            if (!exists)
                this.NotificationError.AddError(ErrorCatalog.UserNotFound);
        }
        catch (error) {
            this.NotificationError.AddError(ErrorCatalog.InternalServerError);
        }
    }
}