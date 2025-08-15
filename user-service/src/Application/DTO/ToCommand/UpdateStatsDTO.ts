import {GameTypeEnum} from "../../Enums/GameTypeEnum.js";

export class UpdateStatsDTO
{
    public readonly gameType: GameTypeEnum
    public readonly player1Uuid: string;
    public readonly player2Uuid: string;
    public readonly player3Uuid: string | null;
    public readonly player4Uuid: string | null;
    public readonly player1Points: number;
    public readonly player2Points: number;
    public readonly player3Points: number | null;
    public readonly player4Points: number | null;

    constructor(gameType: GameTypeEnum, player1Uuid: string, player2Uuid: string, player3Uuid: string | null,
                player4Uuid: string | null, player1Points: number, player2Points: number, player3Points: number | null, player4Points: number | null)
    {
        this.gameType = gameType;
        this.player1Uuid = player1Uuid;
        this.player2Uuid = player2Uuid;
        this.player3Uuid = player3Uuid;
        this.player4Uuid = player4Uuid;
        this.player1Points = player1Points;
        this.player2Points = player2Points;
        this.player3Points = player3Points;
        this.player4Points = player4Points;
    }
}