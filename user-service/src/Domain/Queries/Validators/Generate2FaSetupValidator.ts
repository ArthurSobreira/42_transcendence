import {BaseValidator} from "../../Command/Validators/BaseValidator.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";

export class Generate2FaSetupValidator implements BaseValidator<Generate2FaSetupQuery>
{
    private UserRepository: UserRepository;
    private NotificationError: NotificationError;

    constructor(userRepository: UserRepository, notificationError: NotificationError)
    {
        this.UserRepository = userRepository;
        this.NotificationError = notificationError;
    }

    public async Validator(query: Generate2FaSetupQuery): Promise<void>
    {
        if (await this.UserRepository.VerifyIfUserExistsByUUID(query.Uuid))
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }
}