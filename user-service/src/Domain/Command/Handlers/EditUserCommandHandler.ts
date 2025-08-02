import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {EditUserCommand} from "../CommandObject/EditUserCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import {User} from "../../Entities/Concrete/User.js";

export class EditUserCommandHandler implements BaseHandlerCommand<EditUserCommand, void>
{
    constructor(private UserRepository: UserRepository, Notifcation: NotificationError)
    {
    }

    async Handle(command: EditUserCommand): Promise<void>
    {
        const user: User | null = await this.UserRepository.GetUserEntityByUuid(command.Uuid);

        await this.ChangeFields(user, command);

        await this.UserRepository.Update(command.Uuid, user);
    }

    private async ChangeFields(user: User | null, command: EditUserCommand): Promise<void>
    {
        let emailVO: EmailVO;

        if (command.Anonymous)
            emailVO = EmailVO.AddEmailWithHash(command.Email);
        else
            emailVO = EmailVO.AddEmail(command.Email);

        //user?.ChangeEmail(emailVO);
        user?.ChangePhoto(command.ProfilePic);
        
        if (command.Username) {
            user?.ChangeUsername(command.Username);
        }
        if (command.Password) {
            const passwordHashVO = await PasswordHashVO.Create(command.Password);
            user?.ChangePassword(passwordHashVO);
        }

    }
}