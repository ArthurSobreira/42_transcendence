import {UploadPhotoQueryDTO} from "../../Domain/QueryDTO/UploadPhotoQueryDTO.js";

export class UploadPhotoViewModel
{
    public readonly uuid: string;
    public readonly profilePic: string;

    constructor(uuid: string, profilePic: string)
    {
        this.uuid = uuid;
        this.profilePic = profilePic;
    }

    public static fromQueryDTO(queryDTO: UploadPhotoQueryDTO): UploadPhotoViewModel
    {
        return new UploadPhotoViewModel(queryDTO.uuid, queryDTO.profilePic);
    }
}