import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private health: HealthCheckService, private db: TypeOrmHealthIndicator) {}

  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
