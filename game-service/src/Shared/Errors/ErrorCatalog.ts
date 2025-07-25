import { CustomError } from "./CustomError.js";

export class ErrorCatalog
{
    public static readonly InvalidExtension: CustomError = new CustomError(400, "Invalid file extension. Only .jpg and .png are allowed");
    public static readonly DatabaseViolated: CustomError = new CustomError(400, "A database constraint, like unique, was violated");
    public static readonly InvalidNumberOfParticipants: CustomError = new CustomError(400, "Number of participants must be 4");
    public static readonly InvalidNumberOfParticipantsHistory: CustomError = new CustomError(400, "Invalid number of participants to add in history. Must be 2");
    public static readonly PlayerCantPlayAgainstSelf: CustomError = new CustomError(400, "Player can't play against himself");
    public static readonly NegativePoints: CustomError = new CustomError(400, "Points can't be negative");
    public static readonly NegativeWins: CustomError = new CustomError(400, "Wins can't be negative");
    public static readonly NegativeValues: CustomError = new CustomError(400, "Wins or Total Games can't be negative");
    public static readonly UserNotFound: CustomError = new CustomError(404, "User not found");
    public static readonly TournamentNotFound: CustomError = new CustomError(404, "Tournament not found");
    public static readonly HistoryNotFound: CustomError = new CustomError(404, "History not found");
    public static readonly InternalServerError: CustomError = new CustomError(500, "Internal server error");
    public static readonly InternalBackendApiErrorVerifyIfUsersExists: CustomError = new CustomError(500, "Error while trying to communicate with the backend api - endpont: VerifyIfUsersExists");
    public static readonly InternalBackendApiErrorVerifyIfUserExists: CustomError = new CustomError(500, "Error while trying to communicate with the backend api - endpont: VerifyIfUserExists");
}