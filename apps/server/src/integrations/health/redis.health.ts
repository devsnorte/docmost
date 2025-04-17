import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Injectable, Logger } from '@nestjs/common';
import { EnvironmentService } from '../environment/environment.service';
import { Redis } from 'ioredis';
import { parseRedisUrl } from 'src/common/helpers/utils';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private environmentService: EnvironmentService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
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
      return this.getStatus(key, true);
    } catch (e) {
      this.logger.error(e);
      throw new HealthCheckError(
        `${key} is not available`,
        this.getStatus(key, false),
      );
    }
  }
}
