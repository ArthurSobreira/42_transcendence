import redis from "redis";
import {BaseRedisService} from "./BaseRedisService.js";

export class TokenBlacklistService extends BaseRedisService
{
    private static readonly BLACKLIST_PREFIX = "blacklisted_token:";
    private static inMemoryBlacklist: Map<string, number> = new Map();

    static async blacklistToken(token: string, expirationInSeconds?: number): Promise<void>
    {
        if (this.isConnected) {
            try {
                const key = this.BLACKLIST_PREFIX + token;
                if (expirationInSeconds) {
                    await this.redisClient.set(key, "1", { PX: expirationInSeconds * 1000 });
                } else {
                    await this.redisClient.set(key, "1");
                }
                return;
            } catch (error) {
                console.error("Erro ao adicionar token à blacklist Redis:", error);
            }
        }
        
        const expiryTime = expirationInSeconds 
            ? Date.now() + (expirationInSeconds * 1000)
            : Date.now() + (24 * 60 * 60 * 1000);
        this.inMemoryBlacklist.set(token, expiryTime);
    }

    static async isTokenBlacklisted(token: string): Promise<boolean> {
        if (this.isConnected) {
            try {
                const key = this.BLACKLIST_PREFIX + token;
                const result = await this.redisClient.get(key);
                return result !== null;
            } catch (error) {
                console.error("Erro ao verificar blacklist Redis:", error);
            }
        }
        
        const expiry = this.inMemoryBlacklist.get(token);
        if (!expiry) return false;
        
        if (expiry <= Date.now()) {
            this.inMemoryBlacklist.delete(token);
            return false;
        }
        
        return true;
    }
}