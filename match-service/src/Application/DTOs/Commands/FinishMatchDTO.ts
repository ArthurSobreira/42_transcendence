export class FinishMatchDTO {
    constructor(
        public readonly winnerID: string,
        public readonly endedAt: string,
        public readonly score: string
    )
    {}
}