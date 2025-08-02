import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {EnableTwoFaCommand} from "../CommandObject/EnableTwoFaCommand.js";
import {BaseHandlerCommand} from "./BaseHandlerCommand.js";

export class EnableTwoFaCommandHandler implements BaseHandlerCommand<EnableTwoFaCommand, void>
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(command: EnableTwoFaCommand): Promise<void>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(command.uuid);

        user!.EnableTwoFA(command.secret);

        await this.UserRepository.Update(user!.Uuid, user);
    }
}