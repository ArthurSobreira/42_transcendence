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
    this.NotificationError.CleanErrors();

    const currentUser = await this.UserRepository.GetUserEntityByUuid(command.Uuid);
    if (!currentUser) {
        this.NotificationError.AddError(ErrorCatalog.UserNotFound);
        throw new ValidationException(this.NotificationError.GetAllErrors());
    }

    if (command.Password && !PasswordHashVO.ValidPassword(command.Password)) {
        this.NotificationError.AddError(ErrorCatalog.InvalidPassword);
    }

    if (command.Username && command.Username !== currentUser.Username) {
        if (await this.UserRepository.VerifyIfUserExistsByUsername(command.Username)) {
            this.NotificationError.AddError(ErrorCatalog.UsernameAlreadyExists);
        }
    }

    if (command.ProfilePic != null && !this.CheckExtension(command.ProfilePic))
        this.NotificationError.AddError(ErrorCatalog.InvalidExtension);

    if (this.NotificationError.NumberOfErrors() > 0){
        const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
        throw new ValidationException(allErrors);
    }
}

    private CheckExtension(url: string | null): boolean | undefined {
        if (!url) return undefined;

        const lowerUrl = url.toLowerCase();

        const isImageExtension = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp');
        const isGoogleProfilePic = lowerUrl.includes('lh3.googleusercontent.com/');

        return isImageExtension || isGoogleProfilePic;
    }

}