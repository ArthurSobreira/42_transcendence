// user-service/src/Domain/Entities/Concrete/User.ts
import {BaseEntity} from "../Interface/BaseEntity.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {EmailVO} from "../../ValueObjects/EmailVO.js";
import * as crypto from "crypto";

export class User implements BaseEntity
{
    public Uuid: string;
    public Email: EmailVO;
    public PasswordHash: PasswordHashVO;
    public Auth0Id: string | null = null;
    public Username: string;
    public ProfilePic: string | null = null ;
    public LastLogin: Date | null = null;
    public isOnline: boolean = false;
    public matchesPlayed: number;
    public wins: number;
    public loses: number;
    private twoFactorEnabled: boolean = false;
    private twoFactorSecret: string | null = null;

    constructor(
        email: EmailVO,
        passwordHash: PasswordHashVO,
        username: string,
        profilepic: string | null,
        lastlogin: Date | null,
        isOnline: boolean,
        matchesPlayed: number,
        wins: number,
        loses: number
    ) {
        this.Uuid = crypto.randomUUID();
        this.Email = email;
        this.PasswordHash = passwordHash;
        this.Username = username;
        this.ProfilePic = profilepic;
        this.LastLogin = lastlogin;
        this.isOnline = isOnline;
        this.matchesPlayed = matchesPlayed;
        this.wins = wins;
        this.loses = loses;
    }


    public ChangeEmail(email: EmailVO): void
    {
        if (email.getEmail() != this.Email.getEmail())
            this.Email = email;
    }

    public ChangePassword(passwordHash: PasswordHashVO): void
    {
        if (passwordHash.getPasswordHash() != this.PasswordHash.getPasswordHash())
            this.PasswordHash = passwordHash;
    }

    public ChangeUsername(username: string): void
    {
        if (username != this.Username)
            this.Username = username;
    }

    public ChangePhoto(profilepic: string | null): void
    {
        if (profilepic != this.ProfilePic)
            this.ProfilePic = profilepic;
    }
 
    public ChangeAuth0Id(auth0id: string): void
    {
        if (auth0id != this.Auth0Id)
            this.Auth0Id = auth0id;
    }

    public ChangeStatusOnline(isOnline: boolean): void
    {
        if (isOnline != this.isOnline)
            this.isOnline = isOnline;

        this.LastLogin = new Date();
    }

    public get TwoFactorEnabled(): boolean
    {
        return this.twoFactorEnabled;
    }

    public set EnableTwoFA(secret: string): void
    {
        this.twoFactorSecret = secret;
        this.twoFactorEnabled = true;
    }

    public set DisableTwoFA(): void
    {
        this.twoFactorEnabled = false;
        this.twoFactorSecret = null;
    }

    public static fromDatabase(
        uuid: string,
        email: EmailVO,
        password: PasswordHashVO,
        userName: string,
        profilePic: string | null,
        lastLogin: Date | null,
        isOnline: boolean,
        matchesPlayed: number,
        wins: number,
        loses: number
    ): User
    {
        const user = Object.create(User.prototype);
        user.Uuid = uuid;
        user.Email = email;
        user.PasswordHash = password;
        user.Username = userName;
        user.ProfilePic = profilePic;
        user.LastLogin = lastLogin;
        user.isOnline = isOnline;
        user.matchesPlayed = matchesPlayed;
        user.wins = wins;
        user.loses = loses;
        return user;

    }
}