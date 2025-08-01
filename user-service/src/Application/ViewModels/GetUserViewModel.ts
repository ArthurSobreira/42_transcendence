import {GetUserQueryDTO} from "../../Domain/QueryDTO/GetUserQueryDTO.js";

export class GetUserViewModel
{
    public readonly Uuid: string | null;
    public readonly Username: string | null;
    public readonly Email: string | null;
    public readonly ProfilePic: string | null;
    public readonly matchesPlayed: number | null;
    public readonly wins: number | null;
    public readonly loses: number | null;
    public readonly isOnline: boolean | null;
    public readonly lastLogin: Date | null;
    public readonly twoFactorEnabled: boolean | null;
    public readonly twoFactorSecret: string | null;


    constructor(uuid?: string, username?: string, email?: string, profilepic: string | null = null,
                matchesPlayed? : number | null, wins? : number | null, loses? : number | null, isOnline?: boolean | null, lastLogin?: Date | null,
                twoFactorEnabled: boolean | null, twoFactorSecret: string | null = null)
    {
        this.Uuid = uuid ?? null;
        this.Username = username ?? null;
        this.Email = email ?? null;
        this.ProfilePic = profilepic;
        this.matchesPlayed = matchesPlayed ?? null;
        this.wins = wins ?? null;
        this.loses = loses ?? null;
        this.isOnline = isOnline ?? null;
        this.lastLogin = lastLogin === undefined ? null : lastLogin;
        this.twoFactorEnabled = twoFactorEnabled;
        this.twoFactorSecret = twoFactorSecret;
    }

    public static FromQueryDTO(query: GetUserQueryDTO | null): GetUserViewModel
    {
        return new GetUserViewModel(query?.Uuid, query?.Username, query?.Email, query?.ProfilePic,
            query?.matchesPlayed, query?.wins, query?.loses, query?.isOnline, query?.lastLogin,
            query?.twoFactorEnabled, query?.twoFactorSecret);
    }
}