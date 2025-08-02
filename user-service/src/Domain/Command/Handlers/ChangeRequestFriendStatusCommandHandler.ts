import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {ChangeRequestFriendStatusCommand} from "../CommandObject/ChangeRequestFriendStatusCommand.js";
import {Friendship} from "../../Entities/Concrete/Friendship.js";
import {FriendshipRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/FriendshipRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";

export class ChangeRequestFriendStatusCommandHandler implements BaseHandlerCommand<ChangeRequestFriendStatusCommand, void>
{
    private FriendshipRepository: FriendshipRepository;

    constructor(friendshipRepository: FriendshipRepository, notification: NotificationError)
    {
        this.FriendshipRepository = friendshipRepository;
    }

    async Handle(command: ChangeRequestFriendStatusCommand): Promise<void>
    {
        const friendship: Friendship | null = await this.FriendshipRepository.GetByFriendshipUuid(command.friendshipUuid);

        friendship!.status = command.status;

        await this.FriendshipRepository.Update(command.friendshipUuid, friendship!);
    }
}