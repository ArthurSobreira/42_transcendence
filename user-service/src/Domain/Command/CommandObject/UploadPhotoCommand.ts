import {Multipart} from "@fastify/multipart";
import {UploadPhotoDTO} from "../../../Application/DTO/ToCommand/UploadPhotoDTO.js";

export class UploadPhotoCommand
{
    constructor(public readonly uuid: string, public readonly file: Multipart){}

    public static fromDTO(dto: UploadPhotoDTO): UploadPhotoCommand
    {
        return new UploadPhotoCommand(dto.uuid, dto.file);
    }
}