import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getPersonalStatistics(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendanceRecord.findMany({
      where: { userId, workDate: { gte: startDate, lte: endDate } },
    });

    const leaves = await this.prisma.leaveRecord.findMany({
      where: {
        userId,
        status: 'approved',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    const overtimes = await this.prisma.overtimeRecord.findMany({
      where: {
        userId,
        status: 'approved',
        overtimeDate: { gte: startDate, lte: endDate },
      },
    });

    const workingDays = records.filter((r) => {
      const dow = r.workDate.getDay();
      return dow !== 0 && dow !== 6;
    }).length;

    const lateDays = records.filter((r) => r.isLate).length;
    const earlyLeaveDays = records.filter((r) => r.isEarlyLeave).length;
    const absentDays = records.filter((r) => r.isAbsent).length;
    const leaveDays = leaves.reduce((sum, l) => sum + Number(l.durationDays), 0);
    const overtimeHours = overtimes.reduce((sum, o) => sum + Number(o.durationHours), 0);

    const workDates = Array.from({ length: endDate.getDate() }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      const dow = d.getDay();
      return dow !== 0 && dow !== 6 ? 1 : 0;
    }).reduce((a, b) => a + b, 0);

    return {
      year,
      month,
      shouldAttend: workDates,
      actualAttend: workingDays,
      lateDays,
      earlyLeaveDays,
      absentDays,
      leaveDays,
      overtimeHours,
      overtimeDays: overtimeHours / 8,
    };
  }

  async getDepartmentStatistics(departmentId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const users = await this.prisma.user.findMany({
      where: { departmentId, status: 'active' },
    });

    const userIds = users.map((u) => u.id);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        userId: { in: userIds },
        workDate: { gte: startDate, lte: endDate },
      },
    });

    const lateUsers = records
      .filter((r) => r.isLate)
      .reduce((acc, r) => {
        const user = users.find((u) => u.id === r.userId);
        if (user) {
          acc.push({
            userId: user.id,
            name: user.name,
            lateCount: acc.filter((x) => x.userId === user.id).length + 1,
            totalLateMinutes: r.lateMinutes,
          });
        }
        return acc;
      }, [] as any[]);

    return {
      departmentId,
      memberCount: users.length,
      records: users.map((user) => {
        const userRecords = records.filter((r) => r.userId === user.id);
        return {
          userId: user.id,
          name: user.name,
          lateDays: userRecords.filter((r) => r.isLate).length,
          earlyLeaveDays: userRecords.filter((r) => r.isEarlyLeave).length,
          absentDays: userRecords.filter((r) => r.isAbsent).length,
        };
      }),
    };
  }
}