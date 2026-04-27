import { Module } from '@nestjs/common';
import { ScheduleAppService } from './schedule.service';
import { ScheduleAppController } from './schedule.controller';

@Module({
  controllers: [ScheduleAppController],
  providers: [ScheduleAppService],
  exports: [ScheduleAppService],
})
export class ScheduleAppModule {}