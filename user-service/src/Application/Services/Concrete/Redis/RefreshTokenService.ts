import {BaseRedisService} from "./BaseRedisService.js";

export class RefreshTokenService extends BaseRedisService
{
    private static REFRESH_PREFIX = "refresh_token:";

    static async StoreRefreshToken(userUuid: string, refreshToken: string, expirationInSeconds: number = 604800): Promise<void> // 7 dias
    {
        if (this.isConnected)
        {
            try
            {
                const key = this.REFRESH_PREFIX + refreshToken;
                await this.redisClient.set(key, userUuid, { PX: expirationInSeconds * 1000 });

                const userKey = `user_refresh:${userUuid}`;
                await this.redisClient.sadd(userKey, refreshToken);
                await this.redisClient.expire(userKey, expirationInSeconds);
            }
            catch (error)
            {
                console.error("Error storing refresh token: ", error);
            }
        }
    }

    static async ValidateRefreshToken(refreshToken: string): Promise<string | null>
    {
        if (this.isConnected)
        {
            try
            {
                const key: string = this.REFRESH_PREFIX + refreshToken;
                return await this.redisClient.get(key);
            }
            catch (error)
            {
                console.error("Error validating refresh token: ", error);
                return null;
            }
        }
        return null;
    }

    static async RevokeRefreshToken(refreshToken: string): Promise<void>
    {
        if (this.isConnected)
        {
            try
            {
                const key: string = this.REFRESH_PREFIX + refreshToken;
                await this.redisClient.del(key);
            }
            catch (error)
            {
                console.error("Error revoking refresh token: ", error);
            }
        }
    }

    static async RevokeAllFrashToken(refreshToken: string): Promise<void>
    {
        if (this.isConnected)
        {
            try
            {
                const key: string = this.REFRESH_PREFIX + refreshToken;
                const members = await this.redisClient.smembers(key);

                for (const member of members)
                    await this.redisClient.del(member);

                await this.redisClient.del(key);
            }
            catch (error)
            {
                console.error("Error revoking refresh token: ", error);
            }
        }
    }
}