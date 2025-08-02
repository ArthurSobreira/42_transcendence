import {BaseValidator} from "./BaseValidator.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {UploadPhotoCommand} from "../CommandObject/UploadPhotoCommand.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import { NotificationError } from "src/Shared/Errors/NotificationError.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";

export class UploadPhotoCommandValidator implements BaseValidator<UploadPhotoCommand>
{
    constructor(private UserRepository: UserRepository, private NotificationError: NotificationError)
    {
    }

    public async Validator(command: UploadPhotoCommand): Promise<void>
    {
        const allowedTypes = ['image/png', 'image/jpeg'];

        if (!allowedTypes.includes(command.file.mimetype))
            this.NotificationError.AddError(ErrorCatalog.InvalidExtension);

        if (!await this.UserRepository.VerifyIfUserExistsByUUID(command.uuid))
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }

}