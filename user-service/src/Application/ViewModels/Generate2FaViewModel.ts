import {Generate2FaQueryDTO} from "../../Domain/QueryDTO/Generate2FaQueryDTO.js";

export class Generate2FaViewModel
{
    public readonly uuid: string;
    public readonly qrcode: string;
    public readonly secret: string;

    constructor(uuid: string, qrcode: string, secret: string)
    {
        this.uuid = uuid;
        this.qrcode = qrcode;
        this.secret = secret;
    }

    public static fromQueryDTO(queryDTO: Generate2FaQueryDTO): Generate2FaViewModel
    {
        return new Generate2FaViewModel(queryDTO.Uuid, queryDTO.Qrcode, queryDTO.Secret);
    }
}