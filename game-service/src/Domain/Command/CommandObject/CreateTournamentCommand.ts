import {CreateTournamentDTO} from "../../../Application/DTO/ToCommand/CreateTournamentDTO";

export class CreateTournamentCommand
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

    public static fromDTO(dto: CreateTournamentDTO): CreateTournamentCommand
    {
        return new CreateTournamentCommand(dto.tournamentName, dto.player1Uuid, dto.player2Uuid, dto.player3Uuid, dto.player4Uuid,
            dto.aliasPlayer1, dto.aliasPlayer2, dto.aliasPlayer3, dto.aliasPlayer4);
    }
}