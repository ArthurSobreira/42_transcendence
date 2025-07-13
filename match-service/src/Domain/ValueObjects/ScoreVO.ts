export class ScoreVO
{
    private readonly EndPoint: number; 
    private Score1: number;
    private Score2: number;

    private constructor()
    {
        this.Score1 = 0;
        this.Score2 = 0;
        this.EndPoint = 5;
    }

    public static create(): ScoreVO {
        return new ScoreVO();
    }
    
    public IncrementScore1(): void
    {
        this.Score1 += 1;
    }

    public IncrementScore2(): void
    {
        this.Score2 += 1;
    }

    public hasReachedEnd(): boolean {
        return this.Score1 >= this.EndPoint || this.Score2 >= this.EndPoint;
    }

    public getScore1(): number {
        return this.Score1;
    }

    public getScore2(): number {
        return this.Score2;
    }

    public WhoWin(): number {
        if (this.Score1 > this.Score2)
            return 1;
        return 2;
    }
}