import {BaseValidator} from "./BaseValidator.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import { authenticator } from 'otplib';
import {DisableTwoFaCommand} from "../CommandObject/DisableTwoFaCommand.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import { NotificationError } from "src/Shared/Errors/NotificationError.js";

export class DisableTwoFaCommandValidator implements BaseValidator<DisableTwoFaCommand>
{
    private UserRepository: UserRepository;
    private NotificationError: NotificationError;

    constructor(userRepository: UserRepository, notificationError: NotificationError)
    {
        this.NotificationError = notificationError;
        this.UserRepository = userRepository;
    }

    public async Validator(command: DisableTwoFaCommand): Promise<void>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(command.uuid);

        if (!user || !user.TwoFactorEnabled || !user.twoFactorSecret) {
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);
        }
        else
        {
            const isValid = authenticator.verify({
                token: command.code,
                secret: user.twoFactorSecret
            });

            if (!isValid)
                this.NotificationError.AddError(ErrorCatalog.InvalidToken2Fa);
        }

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }
}