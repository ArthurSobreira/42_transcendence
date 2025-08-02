import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {ChangeRequestFriendStatusCommand} from "../CommandObject/ChangeRequestFriendStatusCommand.js";
import {AddRequestFriendCommand} from "../CommandObject/AddRequestFriendCommand.js";
import {Friendship} from "../../Entities/Concrete/Friendship.js";
import {FriendshipRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/FriendshipRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";

export class AddRequestFriendCommandHandler implements BaseHandlerCommand<AddRequestFriendCommand, void>
{
    private FriendshipRepository: FriendshipRepository;

    constructor(friendshipRepository: FriendshipRepository, notification: NotificationError)
    {
        this.FriendshipRepository = friendshipRepository;
    }

    async Handle(command: AddRequestFriendCommand): Promise<void>
    {
        const friendship = new Friendship(command.status, command.receiverUuid, command.senderUuid);

        await this.FriendshipRepository.Create(friendship);
    }
}