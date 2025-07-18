import { FinishMatchDTO } from "../DTOs/Commands/FinishMatchDTO.js"

export class FinishMatchCommand
{
    constructor(
        public readonly WinnerID: string,
        public readonly EndedAt: Date,
        public readonly Score: string
    )
    {}

    public static FromDTO(dto: FinishMatchDTO): FinishMatchCommand
    {
        const winnerID: string = dto.winnerID;
        const endedAt: Date = new Date(dto.endedAt);
        const score: string = dto.score;

        return new FinishMatchCommand(winnerID, endedAt, score);
    }
}