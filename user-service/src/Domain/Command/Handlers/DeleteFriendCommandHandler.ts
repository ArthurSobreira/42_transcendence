import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {FriendshipRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/FriendshipRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {DeleteFriendCommand} from "../CommandObject/DeleteFriendCommand.js";

export class DeleteFriendCommandHandler implements BaseHandlerCommand<DeleteFriendCommand, void>
{
    constructor(private friendshipRepository: FriendshipRepository, notification: NotificationError){}

    async Handle(command: DeleteFriendCommand): Promise<void>
    {
        return await this.friendshipRepository.Delete(command.friendshipUuid);
    }
}