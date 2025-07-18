import {CustomError} from "./CustomError.js";
import {Result} from "../Utils/Result.js";

export class NotificationError
{
    protected ListOfErrors: CustomError[];

    constructor()
    {
        this.ListOfErrors = [];
    }

    public AddError(customError: CustomError)
    {
        this.ListOfErrors.push(customError);
    }

    public CleanErrors()
    {
        this.ListOfErrors.length = 0;
    }

    public NumberOfErrors(): number
    {
        return this.ListOfErrors.length;
    }

    public GetAllErrors(): CustomError[]
    {
        return this.ListOfErrors;
    }
}