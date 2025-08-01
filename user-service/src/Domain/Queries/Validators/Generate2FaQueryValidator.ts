import {BaseValidator} from "../../Command/Validators/BaseValidator.js";
import {CustomError} from "../../../Shared/Errors/CustomError.js";
import {ValidationException} from "../../../Shared/Errors/ValidationException.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import { NotificationError } from "src/Shared/Errors/NotificationError.js";
import {Generate2FaQuery} from "../QueryObject/Generate2FaQuery.js";

export class Generate2FaQueryValidator implements BaseValidator<Generate2FaQuery>
{
    private UserRepository: UserRepository;
    private NotificationError: NotificationError;

    constructor(userRepository: UserRepository, notificationError: NotificationError)
    {
        this.UserRepository = userRepository;
        this.NotificationError = notificationError;
    }

    public async Validator(query: Generate2FaQuery): Promise<void>
    {
        if (await this.UserRepository.VerifyIfUserExistsByUUID(query.uuid))
            this.NotificationError.AddError(ErrorCatalog.UserNotFound);

        if (this.NotificationError.NumberOfErrors() > 0){
            const allErrors : CustomError[] = this.NotificationError.GetAllErrors();
            throw new ValidationException(allErrors);
        }
    }
}