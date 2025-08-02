export class Generate2FaQueryDTO
{
    public readonly Uuid: string;
    public readonly Qrcode: string;

    constructor(uuid: string, qrcode: string)
    {
        this.Uuid = uuid;
        this.Qrcode = qrcode;
    }
}