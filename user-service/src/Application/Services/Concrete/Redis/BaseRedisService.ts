import redis, { RedisClientType } from 'redis';

export abstract class BaseRedisService
{
    protected static redisClient = RedisClientType;
    protected static isConnected = false;


    static async Initialize()
    {
        try
        {
            await this.redisClient.connect();
            this.isConnected = true;
            console.log("Redis client connected");
        }
        catch (error)
        {
            this.isConnected = false;
            console.error("Error connecting to redis: ", error);
        }
    }

    static async Disconnect()
    {
        if (this.isConnected && this.redisClient)
        {
            this.redisClient.destroy();
            this.isConnected = false;
            console.log("Redis client disconnected");
        }
    }
}