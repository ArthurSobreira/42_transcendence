import {Verify2faDTO} from "../../../Application/DTO/ToQuery/Verify2faDTO.js";

export class Verify2faQuery
{
    public readonly uuid: string;
    public readonly code: string;

    constructor(uuid: string, code: string)
    {
        this.uuid = uuid;
        this.code = code;
    }

    public static fromDTO(dto: Verify2faDTO): Verify2faQuery
    {
        return new Verify2faQuery(dto.uuid, dto.code);
    }
}