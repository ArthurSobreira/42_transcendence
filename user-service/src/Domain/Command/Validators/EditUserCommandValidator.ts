import {BaseValidator} from "./BaseValidator.js";
import {EditUserCommand} from "../CommandObject/EditUserCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";

export class EditUserCommandValidator implements BaseValidator<EditUserCommand>
{
    constructor(private UserRepository: UserRepository, private NotificationError: NotificationError)
    {
    }

    public async Validator(command: EditUserCommand): Promise<void>
    {
        if (!EmailVO.ValidEmail(command.Email)) {
            this.NotificationError.AddError(ErrorCatalog.InvalidEmail);
        }

        if (!PasswordHashVO.ValidPassword(command.Password)) {
            this.NotificationError.AddError(ErrorCatalog.InvalidPassword);
        }

        if (!await this.UserRepository.VerifyIfUserExistsByUUID(command.Uuid))
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);

        if (await this.UserRepository.VerifyIfUserExistsByEmail(command.Email)) {
            this.NotificationError.AddError(ErrorCatalog.EmailAlreadyExists);
        }

        if (!this.CheckExtension(command.ProfilePic) && command.ProfilePic != null)
            this.NotificationError.AddError(ErrorCatalog.InvalidEmail);

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