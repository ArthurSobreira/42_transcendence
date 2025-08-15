import {GetAllTournamentsDTO} from "../../../Application/DTO/ToQuery/GetAllTournamentsDTO";

export class GetAllHistoriesQuery
{
    public readonly username: string;

    constructor(username: string)
    {
        this.username = username;
    }

    public static fromDTO(dto: GetAllTournamentsDTO): GetAllHistoriesQuery
    {
        return new GetAllHistoriesQuery(dto.userUuid);
    }
}