import {EnableTwoFaDTO} from "../../../Application/DTO/ToCommand/EnableTwoFaDTO.js";

export class DisableTwoFaCommand
{
    constructor(public readonly uuid: string, public readonly code: string, public readonly secret: string){}

    public static fromDTO(dto: DisableTwoFaDTO): DisableTwoFaCommand
    {
        return new DisableTwoFaCommand(dto.uuid, dto.code, dto.secret);
    }
}