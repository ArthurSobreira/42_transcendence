import {GetUserQuery} from "../QueryObject/GetUserQuery.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {GetUserDTO} from "../../../Domain/DTO/Query/GetUserDTO.js";
import {BaseHandlerQuery} from "./BaseHandlerQuery.js";
import {GetUserQueryDTO} from "../../../Domain/QueryDTO/GetUserQueryDTO.js";

export class GetUserQueryHandler implements BaseHandlerQuery<GetUserQuery | null>
{
    constructor(private UserRepository: UserRepository, NotificationError: NotificationError)
    {
    }

    async Handle(query: GetUserQuery): Promise<GetUserQueryDTO | null>
    {
        return await this.UserRepository.GetUserQueryDTOByUuid(query.Uuid);
    }
}