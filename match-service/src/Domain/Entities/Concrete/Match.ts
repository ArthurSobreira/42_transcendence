import { BaseEntity } from "../Interface/BaseEntity";
import { MatchEnded } from "../../Events/MatchEnded";
import { ScoreVO } from "../../ValueObjects/ScoreVO";
import { MatchStatus } from "../../Enums/MatchStatus";
import crypto from 'crypto';

export class Match implements BaseEntity
{
    public Uuid: string;
    public Player1Uuid: string;
    public Player2Uuid: string | null;
    public WinnerID: string | null;
    public Score: ScoreVO;
    public StartedAt: Date | null;
    public EndedAt: Date | null;
    public Status: MatchStatus;

    private DomainEvents: any[] = [];

    constructor(
        player1Uuid: string,
    )
    {
        this.Uuid = crypto.randomUUID();
        this.Player1Uuid = player1Uuid;
        this.Player2Uuid = null;
        this.WinnerID = null;
        this.Score = ScoreVO.create();
        this.StartedAt = null;
        this.EndedAt = null;
        this.Status = MatchStatus.Waiting;
    }

    private raise(event: any): void
    {
        this.DomainEvents.push(event);
    }

    public pullDomainEvents(): any[]
    {
        const events = [...this.DomainEvents];
        this.DomainEvents = []
        return events;
    }

    public IncreaseScore(player: string): void
    {
        if (this.Status !== "IN_PROGRESS")
            throw new Error("É possível incrementar no score somente quando a partida estiver em progresso.")
        if (this.Player1Uuid === player)
            this.Score.IncrementScore1();
        else if (this.Player2Uuid === player)
            this.Score.IncrementScore2();
        else
            throw new Error("Player não identificado");
        if (this.Score.hasReachedEnd() == true)
            this.end();
    }

    public start(): void
    {
        if (this.Status !== "WAITING")
            throw new Error("A partida pode somente iniciar quando está sendo aguardada.");
        this.Status = MatchStatus.InProgress;
        this.StartedAt = new Date();
    }

    public end(): void
    {
        if (this.Status === "IN_PROGRESS")
            this.Status = MatchStatus.Finished;
        else
            throw new Error("A partida pode somente encerrar quando estiver em progresso.");
        if (this.Score.WhoWin() == 1)
            this.WinnerID = this.Player1Uuid;
        else
            this.WinnerID = this.Player2Uuid;
        this.EndedAt = new Date();
        this.raise(new MatchEnded(this.Uuid, this.WinnerID!, this.EndedAt))
    }

    public isFinished(): boolean
    {
        return this.Status === "FINISHED";
    }
}
