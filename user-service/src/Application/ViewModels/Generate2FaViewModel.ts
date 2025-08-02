import {Generate2FaQueryDTO} from "../../Domain/QueryDTO/Generate2FaQueryDTO.js";

export class Generate2FaViewModel
{
    public readonly uuid: string;
    public readonly qrcode: string;

    constructor(uuid: string, qrcode: string)
    {
        this.uuid = uuid;
        this.qrcode = qrcode;
    }

    public static fromQueryDTO(queryDTO: Generate2FaQueryDTO): Generate2FaViewModel
    {
        return new Generate2FaViewModel(queryDTO.Uuid, queryDTO.Qrcode);
    }
}