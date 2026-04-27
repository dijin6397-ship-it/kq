import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ScheduleAppModule } from './modules/schedule/schedule.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { FieldWorkModule } from './modules/field-work/field-work.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { ExportModule } from './modules/export/export.module';
import { DingtalkModule } from './dingtalk/dingtalk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    DingtalkModule,
    AuthModule,
    AttendanceModule,
    ApprovalModule,
    CalendarModule,
    ScheduleAppModule,
    StatisticsModule,
    FieldWorkModule,
    NotificationModule,
    AdminModule,
    ExportModule,
  ],
})
export class AppModule {}