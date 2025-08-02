import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {CreateUserCommand} from "../CommandObject/CreateUserCommand.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {User} from "../../Entities/Concrete/User.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";

export class CreateUserCommandHandler implements BaseHandlerCommand<CreateUserCommand, void>
{
    private UserRepository: UserRepository;

    constructor(userRepository: UserRepository, notification: NotificationError) {
        this.UserRepository = userRepository;
    }

    async Handle(command: CreateUserCommand) : Promise<void>
    {
        let emailVO: EmailVO;

        const passwordHashVO = await PasswordHashVO.Create(command.Password);

        if (command.Annonymous) {
            emailVO = EmailVO.AddEmailWithHash(command.Email);
        } else {
            emailVO = EmailVO.AddEmail(command.Email);
        }
        
        const userEntity: User = new User(
            emailVO, 
            passwordHashVO, 
            command.Username, 
            command.ProfilePic, 
            command.LastLogin,
            false,
            0,
            0,
            0
        );
        
        await this.UserRepository.Create(userEntity);
    }
}