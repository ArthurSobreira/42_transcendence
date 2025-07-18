export class StartMatchDTO
{
    constructor(
        public readonly player2Uuid: string | null,
        public readonly startedAt: string
    )
    {}
}