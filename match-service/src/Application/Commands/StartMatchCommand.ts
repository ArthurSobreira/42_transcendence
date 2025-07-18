import { StartMatchDTO } from "../DTOs/Commands/StartMatchDTO.js"

export class StartMatchCommand 
{
    private constructor (
        public readonly Player2Uuid: string | null, 
        public readonly StartedAt: Date,
    )
    {}

    public static FromDTO(dto: StartMatchDTO): StartMatchCommand
    {
        const player2Uuid: string | null = dto.player2Uuid;
        const startedAt: Date = new Date(dto.startedAt);

        return new StartMatchCommand(player2Uuid, startedAt);
    }
}