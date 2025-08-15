import * as crypto from 'crypto';

export class Tournament
{
    public tournamentUuid: string;
    public tournamentName: string;
    public player1Uuid: string;
    public player2Uuid: string;
    public player3Uuid: string;
    public player4Uuid: string;
    public aliasPlayer1: string | null;
    public aliasPlayer2: string | null;
    public aliasPlayer3: string | null;
    public aliasPlayer4: string | null;

    constructor(tournamentName: string, player1Uuid: string, player2Uuid: string, player3Uuid: string, player4Uuid: string,
                aliasPlayer1: string | null, aliasPlayer2: string | null, aliasPlayer3: string | null, aliasPlayer4: string | null)
    {
        this.tournamentUuid = crypto.randomUUID();
        this.tournamentName = tournamentName;
        this.player1Uuid = player1Uuid;
        this.player2Uuid = player2Uuid;
        this.player3Uuid = player3Uuid;
        this.player4Uuid = player4Uuid;
        this.aliasPlayer1 = aliasPlayer1;
        this.aliasPlayer2 = aliasPlayer2;
        this.aliasPlayer3 = aliasPlayer3;
        this.aliasPlayer4 = aliasPlayer4;
    }

    public static fromDatabase(tournamentUuid: string, tournamentName: string, player1Uuid: string, player2Uuid: string, player3Uuid: string, player4Uuid: string,
                               aliasPlayer1: string | null, aliasPlayer2: string | null, aliasPlayer3: string | null, aliasPlayer4: string | null): Tournament
    {
        const tournament= Object.create(Tournament.prototype);
        tournament.tournamentUuid = tournamentUuid;
        tournament.tournamentName = tournamentName;
        tournament.player1Uuid = player1Uuid;
        tournament.player2Uuid = player2Uuid;
        tournament.player3Uuid = player3Uuid;
        tournament.player4Uuid = player4Uuid;
        tournament.aliasPlayer1 = aliasPlayer1;
        tournament.aliasPlayer2 = aliasPlayer2;
        tournament.aliasPlayer3 = aliasPlayer3;
        tournament.aliasPlayer4 = aliasPlayer4;
        return tournament;
    }
}
