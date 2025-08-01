export class GetUserQueryDTO
{
    public readonly Uuid: string;
    public readonly Email: string;
    public readonly Username: string;
    public readonly ProfilePic: string | null;
    public readonly matchesPlayed: number | null;
    public readonly wins: number | null;
    public readonly loses: number | null;
    public readonly isOnline: boolean | null;
    public readonly lastLogin: Date | null;
    public readonly twoFactorEnabled: boolean | null;
    public readonly twoFactorSecret: string | null;

    constructor(uuid: string, email: string, username: string, profilepic: string | null = null,
                matchesPlayed: number, wins: number, loses: number, isOnline: boolean, lastLogin: Date | null,
                twoFactorEnabled: boolean | null, twoFactorSecret: string | null = null)
    {
        this.Uuid = uuid;
        this.Email = email;
        this.Username = username;
        this.ProfilePic = profilepic;
        this.matchesPlayed = matchesPlayed;
        this.wins = wins;
        this.loses = loses;
        this.isOnline = isOnline;
        this.lastLogin = lastLogin;
        this.twoFactorEnabled = twoFactorEnabled;
        this.twoFactorSecret = twoFactorSecret;
    }
}