import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { DingtalkService } from '../../dingtalk/dingtalk.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private dingtalk: DingtalkService,
  ) {}

  async sendNotification(userId: number, type: string, title: string, content: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const notification = await this.prisma.notification.create({
      data: { userId, type, title, content, isSent: false },
    });

    try {
      await this.dingtalk.sendWorkNotice(user.dingtalkUserId, {
        type: 'text',
        content: `${title}\n${content}`,
      });

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { isSent: true, sentAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}: ${error.message}`);
    }
  }

  async getUnread(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  @Cron('5 9 * * 1-5')
  async scanLateUsers() {
    this.logger.log('Scanning late users...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lateRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        workDate: today,
        isLate: true,
      },
      include: { user: true },
    });

    for (const record of lateRecords) {
      if (record.user) {
        await this.sendNotification(
          record.userId,
          'late',
          '上班迟到提醒',
          `您今日上班迟到 ${record.lateMinutes} 分钟，请注意考勤纪律。`,
        );
      }
    }
  }

  @Cron('30 18 * * 1-5')
  async scanMissingCheckOut() {
    this.logger.log('Scanning missing checkout...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        workDate: today,
        checkInTime: { not: null },
        checkOutTime: null,
      },
      include: { user: true },
    });

    for (const record of records) {
      if (record.user) {
        await this.sendNotification(
          record.userId,
          'missing_checkout',
          '下班缺卡提醒',
          `您今日下班未打卡，请及时补卡或联系管理员。`,
        );
      }
    }
  }

  @Cron('0 9 1 * *')
  async sendMonthlySummary() {
    this.logger.log('Sending monthly summary...');

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const users = await this.prisma.user.findMany({
      where: { status: 'active' },
    });

    for (const user of users) {
      const stats = await this.prisma.attendanceRecord.groupBy({
        by: ['isLate', 'isEarlyLeave', 'isAbsent'],
        where: {
          userId: user.id,
          workDate: {
            gte: lastMonth,
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _count: true,
      });

      const lateCount = stats.find((s) => s.isLate)?._count || 0;
      const earlyCount = stats.find((s) => s.isEarlyLeave)?._count || 0;
      const absentCount = stats.find((s) => s.isAbsent)?._count || 0;

      await this.sendNotification(
        user.id,
        'monthly_summary',
        '上月考勤汇总',
        `上月考勤统计：迟到 ${lateCount} 次，早退 ${earlyCount} 次，缺勤 ${absentCount} 天。`,
      );
    }
  }
}