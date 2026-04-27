import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ScheduleAppService {
  constructor(private prisma: PrismaService) {}

  async getMySchedule(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.scheduleAssignment.findMany({
      where: {
        userId,
        workDate: { gte: startDate, lte: endDate },
      },
      include: { shift: true },
      orderBy: { workDate: 'asc' },
    });
  }

  async assignShift(userId: number, shiftId: number, workDate: string) {
    return this.prisma.scheduleAssignment.upsert({
      where: {
        userId_workDate: {
          userId,
          workDate: new Date(workDate),
        },
      },
      update: { shiftId },
      create: {
        userId,
        shiftId,
        workDate: new Date(workDate),
      },
    });
  }

  async batchAssign(userId: number[], shiftId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];

    for (const userId of userId) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const workDate = new Date(d);
        const result = await this.prisma.scheduleAssignment.upsert({
          where: { userId_workDate: { userId, workDate } },
          update: { shiftId },
          create: { userId, shiftId, workDate },
        });
        results.push(result);
      }
    }

    return results;
  }

  async getShifts() {
    return this.prisma.shift.findMany({ where: { isActive: true } });
  }

  async createShift(data: {
    name: string;
    startTime: string;
    endTime: string;
    restStartTime?: string;
    restEndTime?: string;
    color?: string;
  }) {
    return this.prisma.shift.create({ data });
  }

  async getGroups() {
    return this.prisma.attendanceGroup.findMany({
      where: { isActive: true },
      include: { locations: true, shifts: { include: { shift: true } } },
    });
  }

  async createGroup(data: {
    name: string;
    workDays?: string;
    flexTime?: boolean;
    lateGrace?: number;
    earlyGrace?: number;
    maxPatchCard?: number;
  }) {
    return this.prisma.attendanceGroup.create({ data });
  }
}