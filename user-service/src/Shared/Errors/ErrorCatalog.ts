import { CustomError } from "./CustomError.js";

export class ErrorCatalog
{
    public static readonly InvalidEmail: CustomError = new CustomError(400, "Invalid email address");
    public static readonly WrongEmail: CustomError = new CustomError(400, "Wrong email address");
    public static readonly InvalidPassword: CustomError = new CustomError(400, "Invalid password: must be between 8 and 30 characters long");
    public static readonly WrongPassword: CustomError = new CustomError(400, "Wrong password, try again");
    public static readonly UsernameAlreadyExists: CustomError = new CustomError(400, "Username already exists");
    public static readonly EmailAlreadyExists: CustomError = new CustomError(400, "Email already exists");
    public static readonly NegativePoints: CustomError = new CustomError(400, "Points can't be negative");
    public static readonly InvalidExtension: CustomError = new CustomError(400, "Invalid file extension. Only .jpg and .png are allowed");
    public static readonly RequestToSamePerson: CustomError = new CustomError(400, "Invalid request freind. Sender and receiver uuid are the same");
    public static readonly InvalidStatusFriendRequest: CustomError = new CustomError(400, "Invalid friend request status for the operation");
    public static readonly FriendshipAlreadyExists: CustomError = new CustomError(400, "This friendship already exists");
    public static readonly FriendshipNotExists: CustomError = new CustomError(400, "This friendship not exists");
    public static readonly DatabaseViolated: CustomError = new CustomError(400, "A database constraint, like unique, was violated");
    public static readonly InvalidToken2Fa: CustomError = new CustomError(400, "Invalid token for 2FA");
    public static readonly TwofaNotEnabled: CustomError = new CustomError(400, "2FA is not enabled for this user");
    public static readonly UserNotFound: CustomError = new CustomError(404, "User(s) not found");
    public static readonly InternalServerError: CustomError = new CustomError(500, "Internal server error");
}