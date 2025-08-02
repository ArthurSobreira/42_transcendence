export class DisableTwoFaDTO
{
    constructor(public readonly uuid: string, public readonly code: string){}
}