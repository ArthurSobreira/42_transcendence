import {TournamentRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/TournamentRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";
import {BaseValidator} from "./BaseValidator";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog";
import {ValidationException} from "../../../Shared/Errors/ValidationException";
import {CustomError} from "../../../Shared/Errors/CustomError";
import {CreateTournamentCommand} from "../CommandObject/CreateTournamentCommand";
import {UserServiceClient} from "../../../Infrastructure/Http/Concrete/UserServiceClient";

export class CreateTournamentValidator implements BaseValidator<CreateTournamentCommand>
{
    private tournamentRepository: TournamentRepository;
    private NotificationError: NotificationError;
    private backendApiClient: UserServiceClient

    constructor(userRepository: TournamentRepository, notificationError: NotificationError)
    {
        this.tournamentRepository = userRepository;
        this.NotificationError = notificationError;
        this.backendApiClient = new UserServiceClient();
    }

    public async Validator(command: CreateTournamentCommand): Promise<void>
    {
        await this.validateUsersExists(command);

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors: CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }

    private async validateUsersExists(command: CreateTournamentCommand)
    {
        try
        {
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
        catch (error)
        {
            this.NotificationError.AddError(ErrorCatalog.InternalBackendApiErrorVerifyIfUsersExists);
        }
    }
}