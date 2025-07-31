import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import {BaseHandlerQuery} from "./BaseHandlerQuery.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";

export class Generate2FaQueryHandler implements BaseHandlerQuery<Generate2FaQuery, Generate2FaQueryDTO>
{
    constructor(private UserRepository: UserRepository, notificationError: NotificationError)
    {
    }

    async Handle(query: Generate2FaQuery): Promise<boolean>
    {
        let generate2FaQueryDTO: Generate2FaQueryDTO = null;

        const user = await this.UserRepository.GetUserEntityByUuid(query.Uuid);

        if (!user)
            return Generate2FaQueryDTO;

        //TODO: ref: https://blog.logto.io/support-authenticator-app-verification-for-your-nodejs-app
        const secret = authenticator.generateSecret();
        const url = authenticator.keyuri(user.Email, '42_transcendence', secret);
        const qrcode = qrcode.toDataURL(url);

        return new Generate2FaQueryDTO(user.Uuid, qrcode, secret);
    }
}