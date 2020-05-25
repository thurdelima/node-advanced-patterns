import Redis from 'ioredis';

class Cache {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            keyPrefix: 'cache:',
        })
    }

    set(key, value) {
        return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 24 );
    }

    get(key) {
        const cached = await this.redis.get(key);

        return cached ? JSON.parse(cached) : null;
    }

    invalidate(key) {
        return this.redis.del(key);
    }

    
    //caso for prefix: user:2:* com *, deletaremos tudo
    async invalidatePrefix(prefix) {
        const keys = await this.redis.keys(`cache:${prefix}:*`);

        // retirando o cache: por '' da variável keyPrefix
        const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));

        return this.redis.del(keysWithoutPrefix);
    }
}

export default new Cache();