import {IBaseRepository} from "../Interface/IBaseRepository.js";
import {ErrorCatalog} from "../../../../Shared/Errors/ErrorCatalog.js";
import {Tournament} from "../../../../Domain/Entities/Concrete/Tournament";
import {GetTournamentQueryDTO} from "../../../../Domain/QueryDTO/GetTournamentQueryDTO";
import prisma from "../../../Service/PrismaService"

export class TournamentRepository implements IBaseRepository<GetTournamentQueryDTO, Tournament>
{
    public async Create(tournamentEntity: Tournament): Promise<void>
    {
        await prisma.tournament.create({
            data: {
                tournamentUuid: tournamentEntity.tournamentUuid,
                tournamentName: tournamentEntity.tournamentName,
                player1Uuid: tournamentEntity.player1Uuid,
                player2Uuid: tournamentEntity.player2Uuid,
                player3Uuid: tournamentEntity.player3Uuid,
                player4Uuid: tournamentEntity.player4Uuid,
                aliasPlayer1: tournamentEntity.aliasPlayer1,
                aliasPlayer2: tournamentEntity.aliasPlayer2,
                aliasPlayer3: tournamentEntity.aliasPlayer3,
                aliasPlayer4: tournamentEntity.aliasPlayer4,
            },
        });
    }

    public async Update(_uuid: string, tournamentEntity: Tournament | null): Promise<void>
    {
        await prisma.tournament.update({
            where: {tournamentUuid: _uuid},
            data: {
                tournamentName: tournamentEntity?.tournamentName,
                player1Uuid: tournamentEntity?.player1Uuid,
                player2Uuid: tournamentEntity?.player2Uuid,
                player3Uuid: tournamentEntity?.player3Uuid,
                player4Uuid: tournamentEntity?.player4Uuid,
            },
        });
    }

    public async Delete(_uuid: string): Promise<void> {
        await prisma.tournament.delete({
            where: {tournamentUuid: _uuid},
        });
    }

    public async GetAll(): Promise<Tournament[]>
    {
        const tournamentsData = await prisma.tournament.findMany();
        if (!tournamentsData.length) {
            throw new Error(ErrorCatalog.TournamentNotFound.SetError());
        }
        return tournamentsData.map((tournament) => Tournament.fromDatabase(
            tournament.tournamentUuid,
            tournament.tournamentName,
            tournament.player1Uuid,
            tournament.player2Uuid,
            tournament.player3Uuid,
            tournament.player4Uuid,
            tournament.aliasPlayer1,
            tournament.aliasPlayer2,
            tournament.aliasPlayer3,
            tournament.aliasPlayer4,
        ));
    }

    public async GetTournamentQueryDTOByUuid(uuid: string): Promise<GetTournamentQueryDTO | null> {
        const tournamentData = await prisma.tournament.findUnique({where: {tournamentUuid: uuid}});

        if (!tournamentData)
            return null;

        const entity = Tournament.fromDatabase(
            tournamentData.tournamentUuid,
            tournamentData.tournamentName,
            tournamentData.player1Uuid,
            tournamentData.player2Uuid,
            tournamentData.player3Uuid,
            tournamentData.player4Uuid,
            tournamentData.aliasPlayer1,
            tournamentData.aliasPlayer2,
            tournamentData.aliasPlayer3,
            tournamentData.aliasPlayer4,
        );
        return this.mapToQueryDTO(entity);
    }

    public async GetTournamentEntityByUuid(uuid: string): Promise<Tournament | null>
    {
        const tournamentData = await prisma.tournament.findUnique({where: {tournamentUuid: uuid}});

        if (!tournamentData)
            return null;

        return Tournament.fromDatabase(
            tournamentData.tournamentUuid,
            tournamentData.tournamentName,
            tournamentData.player1Uuid,
            tournamentData.player2Uuid,
            tournamentData.player3Uuid,
            tournamentData.player4Uuid,
            tournamentData.aliasPlayer1,
            tournamentData.aliasPlayer2,
            tournamentData.aliasPlayer3,
            tournamentData.aliasPlayer4,
        );
    }

    public async GetAllTournaments(uuid?: string): Promise<GetTournamentQueryDTO[]>
    {
       const tournaments = await prisma.tournament.findMany({
           where: uuid? {
               OR: [
                   {player1Uuid: uuid},
                   {player2Uuid: uuid},
                   {player3Uuid: uuid},
                   {player4Uuid: uuid}
               ]
           } : {}
       });

       return tournaments.map((tournament) =>
           this.mapToQueryDTO(Tournament.fromDatabase(
               tournament.tournamentUuid,
               tournament.tournamentName,
               tournament.player1Uuid,
               tournament.player2Uuid,
               tournament.player3Uuid,
               tournament.player4Uuid,
               tournament.aliasPlayer1,
               tournament.aliasPlayer2,
               tournament.aliasPlayer3,
               tournament.aliasPlayer4,
           )));
    }

    public async VerifyIfTournamentExistsByUUID(uuid: string): Promise<boolean> {
        const user = await prisma.tournament.findUnique({where: {tournamentUuid: uuid}});
        return user !== null;
    }

    private mapToQueryDTO(tournamentEntity: Tournament): GetTournamentQueryDTO {
        return new GetTournamentQueryDTO(
            tournamentEntity.tournamentUuid,
            tournamentEntity.tournamentName,
            tournamentEntity.player1Uuid,
            tournamentEntity.player2Uuid,
            tournamentEntity.player3Uuid,
            tournamentEntity.player4Uuid,
            tournamentEntity.aliasPlayer1,
            tournamentEntity.aliasPlayer2,
            tournamentEntity.aliasPlayer3,
            tournamentEntity.aliasPlayer4,
        );
    }
}
