import {CreateUserCommand} from "../CommandObject/CreateUserCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {BaseValidator} from "./BaseValidator.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";

export class CreateUserCommandValidator implements BaseValidator<CreateUserCommand>
{
    private UserRepository: UserRepository;
    private NotificationError: NotificationError;

    constructor(userRepository: UserRepository, notificationError: NotificationError)
    {
        this.UserRepository = userRepository;
        this.NotificationError = notificationError;
    }

    public async Validator(command: CreateUserCommand): Promise<void>
    {
        this.NotificationError.CleanErrors();
        if (!EmailVO.ValidEmail(command.Email)) {
            this.NotificationError.AddError(ErrorCatalog.InvalidEmail);
        }

        if (!PasswordHashVO.ValidPassword(command.Password)) {
            this.NotificationError.AddError(ErrorCatalog.InvalidPassword);
        }

        if (await this.UserRepository.VerifyIfUserExistsByUsername(command.Username)) {
            this.NotificationError.AddError(ErrorCatalog.UsernameAlreadyExists);
        }

        if (await this.UserRepository.VerifyIfUserExistsByEmail(command.Email)) {
            this.NotificationError.AddError(ErrorCatalog.EmailAlreadyExists);
        }

        if (!this.CheckExtension(command.ProfilePic) && command.ProfilePic != null)
            this.NotificationError.AddError(ErrorCatalog.InvalidExtension);
        
        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }

    private CheckExtension(url: string | null): boolean | undefined
    {
        return url?.toLowerCase().endsWith('.jpg') || url?.toLowerCase().endsWith('.png');
    }
}