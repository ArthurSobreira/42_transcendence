import {Generate2FaDTO} from "../../../Application/DTO/ToQuery/Generate2FaDTO.js";

export class Generate2FaQuery
{
    public readonly uuid: string;

    constructor(uuid: string)
    {
        this.uuid = uuid;
    }

    public static fromQuery(query: Generate2FaQuery): Generate2FaQuery
    {
        return new Generate2FaQuery(query.uuid);
    }

    public static fromDTO(uuid: string): Generate2FaQuery
    {
        return new Generate2FaQuery(uuid);
    }
}