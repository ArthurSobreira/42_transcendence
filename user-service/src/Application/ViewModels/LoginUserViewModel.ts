export class LoginUserViewModel
{
    constructor(public token: string, public uuid: string | null = null,
                public username: string | null = null, public profilePic: string | null = null){}
}