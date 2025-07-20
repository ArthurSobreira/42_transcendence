import { Match } from "../../../Domain/Entities/Concrete/Match";
import { MatchRepository } from "../../../Infrastructure/Persistence/Repositories/MatchRepository";
import { CreateMatchCommand } from "../CreateMatchCommand";
import { BaseHandlerCommand } from "./BaseHandlerCommand";

export class CreateMatchCommandHandler implements BaseHandlerCommand<CreateMatchCommand>
{
    private matchRepository: MatchRepository<Match>;

    constructor(matchRepository: MatchRepository<Match>) {
        this.matchRepository = matchRepository;
    }

    async handle(command: CreateMatchCommand) : Promise<void>
    {
        const player1Uuid: string = command.Player1Uuid;
        const matchEntity: Match = new Match(player1Uuid, null);
        await this.matchRepository.Create(Match);
    }
}