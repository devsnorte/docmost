import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis, { RedisOptions } from 'ioredis';
import { createRetryStrategy, parseRedisUrl } from '../../common/helpers';

export class WsRedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const { host, port, password, db } = parseRedisUrl(process.env.REDIS_URL);
    const options: RedisOptions = {
      host,
      port,
      password,
      db,
      retryStrategy: createRetryStrategy(),
      family: 6,
    };

    const pubClient = new Redis(options);
    const subClient = new Redis(options);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
