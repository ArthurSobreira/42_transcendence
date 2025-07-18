import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {CreateUserCommand} from "../CommandObject/CreateUserCommand.js";
import {PasswordHashVO} from "../../../Domain/ValueObjects/PasswordHashVO.js";
import {EmailVO} from "../../../Domain/ValueObjects/EmailVO.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {User} from "../../../Domain/Entities/Concrete/User.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";

export class CreateUserCommandHandler implements BaseHandlerCommand<CreateUserCommand>
{
    private UserRepository: UserRepository;

    constructor(userRepository: UserRepository, notification: NotificationError) {
        this.UserRepository = userRepository;
    }

    async Handle(command: CreateUserCommand) : Promise<void>
    {
        const passwordHashVO = await PasswordHashVO.Create(command.Password);
        console.log("Passou PasswordHashVO.Create", passwordHashVO)
        const emailVO = EmailVO.AddEmail(command.Email);
        console.log("Passou EmailVO.AddEmail", emailVO)
        const userEntity: User = new User(emailVO, passwordHashVO, command.Username, command.ProfilePic, command.LastLogin, 0, 0, 0);
        console.log("Passou User Entity", userEntity)
        await this.UserRepository.Create(userEntity);
        console.log("Passou UserRepository.Create", userEntity)
    }
}