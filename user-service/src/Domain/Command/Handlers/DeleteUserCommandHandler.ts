import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {DeleteUserCommand} from "../CommandObject/DeleteUserCommand.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";


export class DeleteUserCommandHandler implements BaseHandlerCommand<DeleteUserCommand, void>
{
    constructor(private UserRepository: UserRepository, Notifcation: NotificationError)
    {
    }

    async Handle(command: DeleteUserCommand): Promise<void>
    {
        await this.UserRepository.Delete(command.Uuid);
    }
}