import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import {BaseHandlerQuery} from "./BaseHandlerQuery.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {Generate2FaQueryDTO} from "../../QueryDTO/Generate2FaQueryDTO.js";
import {Generate2FaQuery} from "../QueryObject/Generate2FaQuery.js";

//TODO: ref: https://blog.logto.io/support-authenticator-app-verification-for-your-nodejs-app

export class Generate2FaQueryHandler implements BaseHandlerQuery<Generate2FaQuery, Generate2FaQueryDTO | null>
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(query: Generate2FaQuery): Promise<Generate2FaQueryDTO | null>
    {
        const user = await this.UserRepository.GetUserEntityByUuid(query.uuid);

        if (!user)
            return null;

        const secret = authenticator.generateSecret();
        const url = authenticator.keyuri(user!.Email.getEmail(), '42_transcendence', secret);
        const qrcodeCreated = await qrcode.toDataURL(url);

        return new Generate2FaQueryDTO(user.Uuid, qrcodeCreated, secret);
    }
}
