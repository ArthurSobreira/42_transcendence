import {GetAllTournamentsDTO} from "../../../Application/DTO/ToQuery/GetAllTournamentsDTO";

export class GetAllHistoriesQuery
{
    public readonly userUuid: string;

    constructor(userUuid: string)
    {
        this.userUuid = userUuid;
    }

    public static fromDTO(dto: GetAllTournamentsDTO): GetAllHistoriesQuery
    {
        return new GetAllHistoriesQuery(dto.userUuid);
    }
}