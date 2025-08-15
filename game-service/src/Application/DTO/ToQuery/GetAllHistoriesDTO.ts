export class GetAllHistoriesDTO
{
    public readonly userUuid: string;

    constructor(userUuid: string)
    {
        this.userUuid = userUuid;
    }
}