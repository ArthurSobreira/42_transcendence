import * as crypto from "node:crypto";

export class History
{
    public readonly historyUuid: string;
    public readonly tournamentId?: string;
    public readonly tournamentName?: string;
    public readonly gameType?: string;
    public readonly player1Uuid: string;
    public readonly player1Alias: string | null;
    public readonly player1Points: number;
    public readonly player2Uuid: string;
    public readonly player2Alias: string | null;
    public readonly player2Points: number;
    public readonly player3Uuid: string | null;
    public readonly player3Alias: string | null;
    public readonly player3Points: number | null;
    public readonly player4Uuid: string | null;
    public readonly player4Alias: string | null;
    public readonly player4Points: number | null;

    constructor(tournamentId: string | undefined, tournamentName: string | undefined, gameType: string | undefined, player1Uuid: string, player1Alias: string | null, player1Points: number, player2Uuid: string, player2Alias: string | null, player2Points: number,
                player3Uuid: string | null, player3Alias: string | null, player3Points: number | null, player4Uuid: string | null, player4Alias: string | null, player4Points: number | null)
    {
        this.historyUuid = crypto.randomUUID();
        this.tournamentId = tournamentId;
        this.tournamentName = tournamentName;
        this.gameType = gameType;
        this.player1Uuid = player1Uuid;
        this.player1Alias = player1Alias;
        this.player1Points = player1Points;
        this.player2Uuid = player2Uuid;
        this.player2Alias = player2Alias;
        this.player2Points = player2Points;
        this.player3Uuid = player3Uuid;
        this.player3Alias = player3Alias;
        this.player3Points = player3Points;
        this.player4Uuid = player4Uuid;
        this.player4Alias = player4Alias;
        this.player4Points = player4Points;
    }
}