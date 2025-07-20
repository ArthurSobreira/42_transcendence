import { MatchRepository } from "../../src/Infrastructure/Persistence/Repositories/MatchRepository";
import { Match } from "../../src/Domain/Entities/Concrete/Match";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

describe("MatchRepository", () => {
    const repository = new MatchRepository(prisma);
    let matchUuid: string;

    beforeEach(async () => {
        await prisma.match.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create a match in the database", async () => {
        const match = new Match("marcaluuid");
        matchUuid = match.Uuid;
        await repository.Create(match);
        const saved = await prisma.match.findUnique({ where: { uuid: match.Uuid } });
        console.log(saved);
        expect(saved).toBeDefined();
        expect(saved?.score1).toBe(0);
        expect(saved?.score2).toBe(0);
        expect(saved?.status).toBe("WAITING");
    });

    it("should update a match that will be started in the database", async () => {
        await repository.Update({
            uuid: matchUuid,
            
        })
    })
});
