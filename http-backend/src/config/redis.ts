import { createClient } from "redis";

export const redisClient = createClient();

redisClient.on("error", (err) => console.error("redis error", err));

await redisClient.connect()