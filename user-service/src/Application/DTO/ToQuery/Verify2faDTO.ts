export class Verify2faDTO
{
    public readonly uuid: string;
    public readonly code: string;

    constructor(uuid: string, code: string)
    {
        this.uuid = uuid;
        this.code = code;
    }
}