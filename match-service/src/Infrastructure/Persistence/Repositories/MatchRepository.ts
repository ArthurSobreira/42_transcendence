import { PrismaClient } from "@prisma/client";
import { IMatchRepository } from "../../../Domain/Repositories/IMatchRepository";
import { Match } from "../../../Domain/Entities/Concrete/Match";
import { match } from "assert";

export class MatchRepository implements IMatchRepository<Match> {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async Create(matchEntity: Match): Promise<void> {
        await this.prisma.match.create({
            data: {
                uuid: matchEntity.Uuid, 
                player1Uuid: matchEntity.Player1Uuid,
            },
        });
    }

    public async Update(matchEntity: Match): Promise<void> {
        await this.prisma.match.update({
            where: {uuid: matchEntity.Uuid},
            data: {
                player2Uuid: matchEntity?.Player2Uuid,
                winnerId: matchEntity?.WinnerID,
                score1: matchEntity?.Score.getScore1(),
                score2: matchEntity?.Score.getScore2(),
                startedAt: matchEntity?.StartedAt,
                endedAt: matchEntity?.EndedAt,
                status: matchEntity?.Status
            },
        });
    }

    public async FindByUuid(uuid: string): Promise<Match | null> {
        const data = await this.prisma.match.findUnique({ where: { uuid } });
        if (!data)
            return null;
        
    }

    // public async Delete(uuid: string): Promise<void> {
        
    // }

    // public async GetAll(): Promise<Match[]> {
        
    // }

}