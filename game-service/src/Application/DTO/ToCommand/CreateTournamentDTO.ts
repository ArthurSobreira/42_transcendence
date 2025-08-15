export class CreateTournamentDTO
{
    public readonly tournamentName: string;
    public readonly player1Uuid: string;
    public readonly player2Uuid: string;
    public readonly player3Uuid: string;
    public readonly player4Uuid: string;
    public readonly aliasPlayer1: string | null;
    public readonly aliasPlayer2: string | null;
    public readonly aliasPlayer3: string | null;
    public readonly aliasPlayer4: string | null;

    constructor(tournamentName: string, player1Uuid: string, player2Uuid: string, player3Uuid: string, player4Uuid: string,
                aliasPlayer1: string | null, aliasPlayer2: string | null, aliasPlayer3: string | null, aliasPlayer4: string | null)
    {
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
}