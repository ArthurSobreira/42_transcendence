export class Generate2FaQueryDTO
{
    public readonly Uuid: string;
    public readonly Qrcode: string;
    public readonly Secret: string;

    constructor(uuid: string, qrcode: string, secret: string)
    {
        this.Uuid = uuid;
        this.Qrcode = qrcode;
        this.Secret = secret;
    }
}