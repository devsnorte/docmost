import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Injectable, Logger } from '@nestjs/common';
import { EnvironmentService } from '../environment/environment.service';
import { Redis } from 'ioredis';
import { parseRedisUrl } from 'src/common/helpers/utils';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private environmentService: EnvironmentService,
  ) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const { host, port, password, db } = parseRedisUrl(
        this.environmentService.getRedisUrl(),
      );
      const redis = new Redis({
        host,
        port,
        password,
        db,
        maxRetriesPerRequest: 15,
        family: 6,
      });

      await redis.ping();
      redis.disconnect();
      return indicator.up();
    } catch (e) {
      this.logger.error(e);
      return indicator.down(`${key} is not available`);
    }
  }
}
