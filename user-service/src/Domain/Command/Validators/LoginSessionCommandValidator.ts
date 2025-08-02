import {BaseValidator} from "./BaseValidator.js";
import {UserSessionCommand} from "../CommandObject/UserSessionCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";

export class LoginSessionCommandValidator implements BaseValidator<UserSessionCommand>
{
    constructor(private UserRepository: UserRepository, private NotificationError: NotificationError)
    {
    }

    public async Validator(command: UserSessionCommand): Promise<void>
    {
        this.NotificationError.CleanErrors();

        if (!EmailVO.ValidEmail(command.Email))
            this.NotificationError.AddError(ErrorCatalog.InvalidEmail);

        if (!PasswordHashVO.ValidPassword(command.Password))
            this.NotificationError.AddError(ErrorCatalog.InvalidPassword);

        const user = await this.UserRepository.GetUserEntityByEmail(command.Email);
        if (!user) {
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);
        } else {
            const isPasswordValid = await PasswordHashVO.Validate(
                command.Password,
                user.PasswordHash.getPasswordHash()
            );

            if (!isPasswordValid) {
                this.NotificationError.AddError(ErrorCatalog.WrongPassword);
            }
        }

        if (this.NotificationError.NumberOfErrors() > 0) {
            const allErrors: CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }
}