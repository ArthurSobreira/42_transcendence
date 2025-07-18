import { CreateMatchDTO } from "../DTOs/Commands/CreateMatchDTO.js"

export class CreateMatchCommand
{
    private constructor(
        public readonly Player1Uuid: string,
    )
    {}

    public static FromDTO(dto: CreateMatchDTO): CreateMatchCommand
    {
        const player1Uuid: string = dto.player1Uuid;

        return new CreateMatchCommand(player1Uuid)
    }
}