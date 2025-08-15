import { CustomError } from "./CustomError.js";

export class ErrorCatalog
{
    public static readonly InvalidExtension: CustomError = new CustomError(101, "Invalid file extension. Only .jpg and .png are allowed");
    public static readonly DatabaseViolated: CustomError = new CustomError(102, "A database constraint, like unique, was violated");
    public static readonly InvalidNumberOfParticipants: CustomError = new CustomError(103, "Number of participants must be 4");
    public static readonly InvalidNumberOfParticipantsHistory: CustomError = new CustomError(104, "Invalid number of participants to add in history. Must be 2");
    public static readonly PlayerCantPlayAgainstSelf: CustomError = new CustomError(105, "Player can't play against himself");
    public static readonly NegativePoints: CustomError = new CustomError(106, "Points can't be negative");
    public static readonly NegativeWins: CustomError = new CustomError(107, "Wins can't be negative");
    public static readonly NegativeValues: CustomError = new CustomError(108, "Wins or Total Games can't be negative");
    public static readonly InternalBackendApiErrorVerifyIfUsersExists: CustomError = new CustomError(109, "Error while trying to communicate with the backend api - endpont: VerifyIfUsersExists");
    public static readonly InternalBackendApiErrorVerifyIfUsersExistsByUuids: CustomError = new CustomError(110, "Error while trying to communicate with the user-sevice api - endpont: VerifyIfUsersExistsByUuids");
    public static readonly UserNotFound: CustomError = new CustomError(111, "User not found");
    public static readonly TournamentNotFound: CustomError = new CustomError(112, "Tournament not found");
    public static readonly HistoryNotFound: CustomError = new CustomError(113, "History not found");
    public static readonly InternalServerError: CustomError = new CustomError(500, "Internal server error");
}