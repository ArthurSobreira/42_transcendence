import {Result} from "../../Shared/Utils/Result.js";
import {FastifyReply} from "fastify";
import {NotificationError} from "../../Shared/Errors/NotificationError.js";
import {ErrorTypeEnum} from "../../Application/Enums/ErrorTypeEnum.js";

export abstract class BaseController
{
    protected handleResult<T>(result: Result<T>, reply: FastifyReply, notificationError: NotificationError)
    {
        notificationError.CleanErrors();

        if (result.isSucess)
        {
            const responseData = result.getData();
            if (responseData !== undefined && responseData !== null) {
                return reply.status(200).send(responseData);
            }
            return reply.status(200).send(result.getMessage());
        }
        else
            return reply.status(this.getStatusCodeFromErrorType(result.Error)).send({ message: result.getMessage() })
    }

    private getStatusCodeFromErrorType(ErrorType?: ErrorTypeEnum): number
    {
        switch (ErrorType)
        {
            case ErrorTypeEnum.VALIDATION:
                return 400;
            case ErrorTypeEnum.NOT_FOUND:
                return 404;
            case ErrorTypeEnum.CONFLICT:
                return 409;
            case ErrorTypeEnum.INTERNAL:
            default:
                return 500;
        }
    }
}