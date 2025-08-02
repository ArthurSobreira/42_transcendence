import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {UserSessionCommand} from "../CommandObject/UserSessionCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";

export class LogoutSessionCommandHandler implements BaseHandlerCommand<UserSessionCommand, void>
{
    constructor(private UserRepository: UserRepository)
    {
    }

    async Handle(command: UserSessionCommand): Promise<void>
    {
        const user = await this.UserRepository.GetUserEntityByEmail(command.Email);

        user?.ChangeStatusOnline(command.isOnline);

        await this.UserRepository.Update(user!.Uuid, user);
    }
}