import {BaseHandlerQuery} from "./BaseHandlerQuery";
import {GetAllHistoriesQuery} from "../QueryObject/GetAllHistoriesQuery";
import {GetAllHistoriesQueryDTO} from "../../QueryDTO/GetAllHistoriesQueryDTO";
import {HistoryRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/HistoryRepository";
import {NotificationError} from "../../../Shared/Errors/NotificationError";

export class GetAllHistoriesQueryHandler implements BaseHandlerQuery<GetAllHistoriesQuery, GetAllHistoriesQueryDTO[] | null>
{
    constructor(private historyRepository: HistoryRepository, NotificationError: NotificationError)
    {
    }

    async Handle(query: GetAllHistoriesQuery): Promise<GetAllHistoriesQueryDTO[] | null>
    {
        const historyData = await this.historyRepository.GetAllHistoriesByUsername(query.userUuid);

        if (!historyData) {
            return null;
        }

        return historyData.map(history => new GetAllHistoriesQueryDTO(
            history.historyUuid,
            history.tournamentId,
            history.tournamentName,
            history.gameType,
            history.player1Username,
            history.player1Alias,
            history.player1Points,
            history.player2Username,
            history.player2Alias,
            history.player2Points,
            history.player3Username,
            history.player3Alias,
            history.player3Points,
            history.player4Username,
            history.player4Alias,
            history.player4Points,
        ));
    }
}