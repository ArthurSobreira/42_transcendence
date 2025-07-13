export class MatchEnded {
  constructor(
    public readonly matchId: string,
    public readonly winnerId: string,
    public readonly finishedAt: Date
  ) {}
}
