import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {DisableTwoFaCommand} from "../CommandObject/DisableTwoFaCommand.js";
import {BaseHandlerCommand} from "./BaseHandlerCommand.js";

export class DisableTwoFaCommandHandler implements BaseHandlerCommand<DisableTwoFaCommand, void>
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(command: DisableTwoFaCommand): Promise<void>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(command.uuid);

        user!.DisableTwoFA();

        await this.UserRepository.Update(user!.Uuid, user);
    }
}