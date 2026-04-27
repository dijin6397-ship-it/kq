import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { DingtalkService } from '../../dingtalk/dingtalk.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private dingtalk: DingtalkService,
  ) {}

  async getTodayStatus(userId: number, dingtalkUserId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        userId,
        workDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      date: today.toISOString().split('T')[0],
      checkInTime: record?.checkInTime || null,
      checkOutTime: record?.checkOutTime || null,
      checkInResult: record?.checkInResult || null,
      checkOutResult: record?.checkOutResult || null,
      timeResult: record?.timeResult || null,
      locationResult: record?.locationResult || null,
      isLate: record?.isLate || false,
      isEarlyLeave: record?.isEarlyLeave || false,
      isAbsent: record?.isAbsent || false,
      lateMinutes: record?.lateMinutes || 0,
      earlyMinutes: record?.earlyMinutes || 0,
    };
  }

  async getTodayDetail(userId: number, dingtalkUserId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        userId,
        workDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            departmentName: true,
          },
        },
      },
    });

    const schedule = await this.prisma.scheduleAssignment.findFirst({
      where: {
        userId,
        workDate: today,
      },
      include: {
        fieldWorkRecord: true,
      },
    });

    return {
      record: record || null,
      schedule: schedule || null,
      fieldWork: schedule?.fieldWorkRecord || null,
    };
  }

  async syncAttendanceFromDingtalk(
    userIds: string[],
    fromDate: string,
    toDate: string,
  ) {
    const records = await this.dingtalk.getAttendanceRecords(userIds, fromDate, toDate);
    const batchId = `sync_${Date.now()}`;

    for (const record of records) {
      const user = await this.prisma.user.findUnique({
        where: { dingtalkUserId: record.userId },
      });

      if (!user) continue;

      const workDate = new Date(record.workDate);
      workDate.setHours(0, 0, 0, 0);

      await this.prisma.attendanceRecord.upsert({
        where: {
          userId_workDate: {
            userId: user.id,
            workDate,
          },
        },
        update: {
          checkInTime: record.checkInTime ? new Date(record.checkInTime) : null,
          checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : null,
          checkInResult: record.checkInResult,
          checkOutResult: record.checkOutResult,
          timeResult: record.timeResult,
          locationResult: record.locationResult,
          sourceType: record.sourceType,
          isLate: record.isLate,
          isEarlyLeave: record.isEarlyLeave,
          isAbsent: record.isAbsent,
          lateMinutes: record.lateMinutes || 0,
          earlyMinutes: record.earlyMinutes || 0,
          syncBatchId: batchId,
        },
        create: {
          userId: user.id,
          dingtalkUserId: record.userId,
          workDate,
          checkInTime: record.checkInTime ? new Date(record.checkInTime) : null,
          checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : null,
          checkInResult: record.checkInResult,
          checkOutResult: record.checkOutResult,
          timeResult: record.timeResult,
          locationResult: record.locationResult,
          sourceType: record.sourceType,
          isLate: record.isLate || false,
          isEarlyLeave: record.isEarlyLeave || false,
          isAbsent: record.isAbsent || false,
          lateMinutes: record.lateMinutes || 0,
          earlyMinutes: record.earlyMinutes || 0,
          syncBatchId: batchId,
        },
      });
    }

    return { synced: records.length, batchId };
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncTodayAttendance() {
    this.logger.log('Running scheduled attendance sync...');

    const users = await this.prisma.user.findMany({
      where: { status: 'active' },
      select: { dingtalkUserId: true },
    });

    const userIds = users.map((u) => u.dingtalkUserId);
    const today = new Date().toISOString().split('T')[0];

    if (userIds.length > 0) {
      await this.syncAttendanceFromDingtalk(userIds, today, today);
    }
  }
}