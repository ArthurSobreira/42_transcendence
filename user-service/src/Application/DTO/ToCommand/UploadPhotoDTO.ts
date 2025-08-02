import {Multipart} from "@fastify/multipart";

export class UploadPhotoDTO
{
    constructor(public readonly uuid: string, public readonly file: Multipart){}
}