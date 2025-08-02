import {EnableTwoFaDTO} from "../../../Application/DTO/ToCommand/EnableTwoFaDTO.js";
import {DisableTwoFaDTO} from "../../../Application/DTO/ToCommand/DisableTwoFaDTO.js";

export class DisableTwoFaCommand
{
    constructor(public readonly uuid: string, public readonly code: string){}

    public static fromDTO(dto: DisableTwoFaDTO): DisableTwoFaCommand
    {
        return new DisableTwoFaCommand(dto.uuid, dto.code);
    }
}