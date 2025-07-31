import {EnableTwoFaDTO} from "../../../Application/DTO/ToCommand/EnableTwoFaDTO.js";

export class EnableTwoFaCommand
{
    constructor(public readonly uuid: string, public readonly code: string, public readonly secret: string){}

    public static fromDTO(dto: EnableTwoFaDTO): EnableTwoFaCommand
    {
        return new EnableTwoFaCommand(dto.uuid, dto.code, dto.secret);
    }
}