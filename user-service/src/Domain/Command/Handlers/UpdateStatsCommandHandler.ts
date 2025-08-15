import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {User} from "../../Entities/Concrete/User.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {ErrorCatalog} from "../../../Shared/Errors/ErrorCatalog.js";
import {UpdateStatsCommand} from "../CommandObject/UpdateStatsCommand.js";
import {GameTypeEnum} from "../../../Application/Enums/GameTypeEnum.js";

export class UpdateStatsCommandHandler implements BaseHandlerCommand<UpdateStatsCommand, void>
{
    private userRepository: UserRepository;
    private notificationError: NotificationError;

    constructor(userRepository: UserRepository, notification: NotificationError)
    {
        this.userRepository = userRepository;
        this.notificationError = notification;
    }

    async Handle(command: UpdateStatsCommand): Promise<void>
    {
        switch(command.gameType)
        {
            case GameTypeEnum.SINGLEPLAYER:
            case GameTypeEnum.MULTIPLAYER_LOCAL:
            case GameTypeEnum.RPS:
                return await UpdateStatsCommandHandler.UpdateStatsForTwoPlayers(command, this.userRepository, this.notificationError);

            case GameTypeEnum.MULTIPLAYER_REMOTO:
            case GameTypeEnum.TOURNAMENT:
                return await UpdateStatsCommandHandler.UpdateStatsForFourPlayers(command, this.userRepository, this.notificationError);

            default:
                return;
        }
    }

    private static async UpdateStatsForTwoPlayers(command: UpdateStatsCommand, userRepository: UserRepository, notificationError: NotificationError): Promise<void>
    {
        const usersList: string[] = [command.player1Uuid, command.player2Uuid];
        const usersEntities: User[] = await userRepository.GetUsersEntitiesByUuid(usersList);

        if (!usersEntities)
        {
            notificationError.AddError(ErrorCatalog.UserNotFound);
            return;
        }

        UpdateStatsCommandHandler.UpdateStats(command, usersEntities, notificationError);
        if (notificationError.NumberOfErrors() > 0)
            return;

        await userRepository.UpdateInBatch(usersEntities);
        return ;
    }

    private static async UpdateStatsForFourPlayers(command: UpdateStatsCommand, userRepository: UserRepository, notificationError: NotificationError): Promise<void>
    {
        const usersList: (string | null)[] = [command.player1Uuid, command.player2Uuid, command.player3Uuid, command.player4Uuid];
        const usersEntities: User[] = await userRepository.GetUsersEntitiesByUuid(usersList as string[]);

        if (!usersEntities)
        {
            notificationError.AddError(ErrorCatalog.UserNotFound);
            return;
        }

        UpdateStatsCommandHandler.UpdateStats(command, usersEntities, notificationError);
        if (notificationError.NumberOfErrors() > 0)
            return;

        await userRepository.UpdateInBatch(usersEntities);
        return ;
    }

    private static UpdateStats(command: UpdateStatsCommand, usersEntities: User[], notificationError: NotificationError): void
    {
        type usersInfo = [string | null, number | null];

        const usersList: usersInfo[] = [
            [command.player1Uuid, command.player1Points] as usersInfo,
            [command.player2Uuid, command.player2Points] as usersInfo,
            [command.player3Uuid, command.player3Points] as usersInfo,
            [command.player4Uuid, command.player4Points] as usersInfo
        ].filter(([uuid, points]) => uuid !== null && points !== null)
            .sort((a, b) => (b[1] as number) - (a[1] as number));

        const players: User[] = [];
        for (let i: number = 0; i < usersList.length; i++)
        {
            const player: User | undefined = usersEntities.find(user => user.Uuid === usersList[i][0]);
            if (player)
                players.push(player);
        }

        if (command.gameType === GameTypeEnum.TOURNAMENT && players.length === 4)
        {
            this.WinStats(players[0], notificationError);
            this.WinStats(players[0], notificationError);
            this.WinStats(players[1], notificationError);
            this.LoserStats(players[1], notificationError);
            this.LoserStats(players[2], notificationError);
            this.LoserStats(players[3], notificationError);
        }
        else if (command.gameType === GameTypeEnum.MULTIPLAYER_REMOTO && players.length === 4)
        {
            this.WinStats(players[0], notificationError);
            this.LoserStats(players[1], notificationError);
            this.LoserStats(players[2], notificationError);
            this.LoserStats(players[3], notificationError);
        }
        else if (players.length === 2)
        {
            this.WinStats(players[0], notificationError);
            this.LoserStats(players[1], notificationError);
        }
    }

    private static WinStats(winner: User, notificationError: NotificationError): void
    {
        if (!winner)
        {
            notificationError.AddError(ErrorCatalog.UserNotFound);
            return;
        }

        winner.wins += 1;
        winner.matchesPlayed += 1;
    }

    private static LoserStats(loser: User, notificationError: NotificationError): void
    {
        if (!loser)
        {
            notificationError.AddError(ErrorCatalog.UserNotFound);
            return;
        }

        loser.matchesPlayed += 1;
        loser.loses += 1;
    }
}