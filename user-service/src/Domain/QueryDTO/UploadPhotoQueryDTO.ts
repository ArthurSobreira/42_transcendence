export class UploadPhotoQueryDTO
{
    public readonly uuid: string;
    public readonly profilePic: string;

    constructor(uuid: string, profilePic: string)
    {
        this.uuid = uuid;
        this.profilePic = profilePic;
    }
}