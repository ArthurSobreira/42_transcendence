import {BaseValidator} from "./BaseValidator.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import { authenticator } from 'otplib';
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {EnableTwoFaCommand} from "../CommandObject/EnableTwoFaCommand.js";

export class EnableTwoFaCommandValidator implements BaseValidator<EnableTwoFaCommand>
{
    private UserRepository: UserRepository;
    private NotificationError: NotificationError;

    constructor(userRepository: UserRepository, notificationError: NotificationError)
    {
        this.NotificationError = notificationError;
        this.UserRepository = userRepository;
    }

    public async Validator(command: EnableTwoFaCommand): Promise<void>
    {
        if (await this.UserRepository.VerifyIfUserExistsByUUID(command.Uuid))
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);

        const isValid = authenticator.verify({ token: code, secret });
        if (!isValid)
            this.NotificationError.AddError(ErrorCatalog.InvalidToken2Fa);

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }
}