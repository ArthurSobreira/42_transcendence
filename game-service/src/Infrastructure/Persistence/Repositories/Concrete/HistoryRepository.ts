import {IBaseRepository} from "../Interface/IBaseRepository";
import {History} from "../../../../Domain/Entities/Concrete/History";
import prisma from "../../../Service/PrismaService";
import {ErrorCatalog} from "../../../../Shared/Errors/ErrorCatalog";
import {GetAllHistoriesQueryDTO} from "../../../../Domain/QueryDTO/GetAllHistoriesQueryDTO";
import { NotificationError } from "src/Shared/Errors/NotificationError";

export class HistoryRepository implements IBaseRepository<GetAllHistoriesQueryDTO, History>
{

    public async Create(entity: History): Promise<void>
    {
        await prisma.history.create({
            data: {
                historyUuid: entity.historyUuid,
                tournamentId: entity.tournamentId,
                tournamentName: entity.tournamentName,
                gameType: entity.gameType,
                player1Uuid: entity.player1Uuid,
                player1Alias: entity.player1Alias,
                player1Points: entity.player1Points,
                player2Uuid: entity.player2Uuid,
                player2Alias: entity.player2Alias,
                player2Points: entity.player2Points,
                player3Uuid: entity.player3Uuid,
                player3Alias: entity.player3Alias,
                player3Points: entity.player3Points,
                player4Uuid: entity.player4Uuid,
                player4Alias: entity.player4Alias,
                player4Points: entity.player4Points,
            }
        });
    }

    public async GetAllHistoriesByUuid(uuid: string): Promise<any[]>
    {
        const historyData = await prisma.history.findMany({
            where: uuid? {
                OR: [
                    {player1Uuid: uuid},
                    {player2Uuid: uuid},
                    {player3Uuid: uuid},
                    {player4Uuid: uuid},
                ]
            } : {}
        });

        return historyData;
    }

    Update(_uuid: string, entity: History, notification: NotificationError): Promise<void> {
        throw new Error("Method not implemented.");
    }
    Delete(_uuid: string, notification: NotificationError): Promise<void> {
        throw new Error("Method not implemented.");
    }
    GetAll(): Promise<History[] | null> {
        throw new Error("Method not implemented.");
    }
}