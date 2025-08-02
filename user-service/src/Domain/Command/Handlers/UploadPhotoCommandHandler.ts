import {UploadPhotoCommand} from "../CommandObject/UploadPhotoCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {FastifyRequest} from "fastify";
import {UploadPhotoDTO} from "../../../Application/DTO/ToCommand/UploadPhotoDTO.js";
import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {Multipart} from "@fastify/multipart";
import * as path from 'node:path'
import {User} from "../../Entities/Concrete/User.js";
import * as fs from "node:fs";
import { pipeline } from 'stream/promises';
import {UploadPhotoQueryDTO} from "../../QueryDTO/UploadPhotoQueryDTO.js";

export class UploadPhotoCommandHandler implements BaseHandlerCommand<UploadPhotoCommand, UploadPhotoQueryDTO>
{
    private readonly uploadPath = path.join(process.cwd(), 'img');

    constructor(private userRepository: UserRepository, private notificationError: NotificationError)
    {
    }

    async Handle(command: UploadPhotoCommand, request: FastifyRequest<{ Body: UploadPhotoDTO }>)
    {
        const user = await this.userRepository.GetUserEntityByUuid(command.uuid);

        const data: Multipart = command.file;
        const timestamp = Date.now();
        const ext = this.getFileExtension(data);

        const filename = `${user?.Username}${timestamp}.${ext}`;
        const filepath = this.uploadPath + '/' + filename;

        await this.cleanupOldPhoto(user!);
        await this.SaveFile(filepath, data, request, user!);
        await this.userRepository.Update(user!.Uuid, user);
        return new UploadPhotoQueryDTO(user!.Uuid, filename);
    }

    private getFileExtension(fileData: Multipart): string
    {
        const mimeTypes: { [key: string]: string } = {
            "image/jpeg": "jpg",
            "image/png": "png",
        }

        return mimeTypes[fileData.mimetype];
    }

    private async cleanupOldPhoto(user: User): Promise<void>
    {
        if (!user.ProfilePic)
            return;

        try
        {
            await fs.promises.unlink(user.ProfilePic);
            user.ProfilePic = null;
        }
        catch (error)
        {
            console.warn('Failed to delete old photo: ', error);
        }
    }

    private async SaveFile(filename: string, data: Multipart, request: FastifyRequest<{ Body: UploadPhotoDTO }>, user: User)
    {
        if (data.type === 'file')
            await pipeline(data.file, fs.createWriteStream(filename))

        user.ProfilePic = filename;
    }
}