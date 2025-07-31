import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";

export class DisableTwoFaCommandHandler
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(command: DisableTwoFaCommand): Promise<void>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(command.Uuid);

        user!.DisableTwoFA();

        await this.UserRepository.Update(user!.Uuid, user);
    }
}