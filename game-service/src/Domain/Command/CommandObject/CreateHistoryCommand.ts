import {CreateHistoryDTO} from "../../../Application/DTO/ToCommand/CreateHistoryDTO";
import {GameTypeEnum} from "../../../Application/Enum/GameTypeEnum";

export class CreateHistoryCommand
{
    public readonly gameType: GameTypeEnum
    public readonly tournamentId?: string;
    public readonly tournamentName?: string;
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

    constructor(gameType: GameTypeEnum, tournamentId: string | undefined, tournamentName: string | undefined, player1Uuid: string, player1Alias: string | null, player1Points: number, player2Uuid: string, player2Alias: string | null, player2Points: number,
                player3Uuid: string | null, player3Alias: string | null, player3Points: number | null, player4Uuid: string | null, player4Alias: string | null, player4Points: number | null)
    {
        this.gameType = gameType;
        this.tournamentId = tournamentId;
        this.tournamentName = tournamentName;
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

    public static fromDTO(dto: CreateHistoryDTO)
    {
        return new CreateHistoryCommand(
            dto.gameType,
            dto.tournamentId,
            dto.tournamentName,
            dto.player1Uuid,
            dto.player1Alias,
            dto.player1Points,
            dto.player2Uuid,
            dto.player2Alias,
            dto.player2Points,
            dto.player3Uuid,
            dto.player3Alias,
            dto.player3Points,
            dto.player4Uuid,
            dto.player4Alias,
            dto.player4Points
        );
    }
}