export class CreateMatchDTO
{
    public readonly player1Uuid: string;

    constructor(_player1Uuid: string)
    {
        this.player1Uuid = _player1Uuid;
    }
}