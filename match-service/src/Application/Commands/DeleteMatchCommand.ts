export class DeleteMatchCommand
{
    public readonly Uuid: string;

    constructor(uuid: string)
    {
        this.Uuid = uuid;
    }
}