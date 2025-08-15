export class GetAllTournamentsDTO
{
    public readonly userUuid: string;

    constructor(userUuid: string)
    {
        this.userUuid = userUuid;
    }
}