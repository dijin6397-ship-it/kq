import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarData(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        userId,
        workDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { workDate: 'asc' },
    });

    const schedules = await this.prisma.scheduleAssignment.findMany({
      where: {
        userId,
        workDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        shift: true,
        fieldWorkRecord: true,
      },
      orderBy: { workDate: 'asc' },
    });

    const leaveRecords = await this.prisma.leaveRecord.findMany({
      where: {
        userId,
        status: 'approved',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    const days: Array<{
      date: string;
      status: 'normal' | 'late' | 'early_leave' | 'absent' | 'leave' | 'overtime' | 'field_work' | 'weekend' | 'holiday';
      checkInTime?: string | null;
      checkOutTime?: string | null;
      shiftName?: string;
      remark?: string;
    }> = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const record = records.find((r) => r.workDate.toISOString().split('T')[0] === dateStr);
      const schedule = schedules.find((s) => s.workDate.toISOString().split('T')[0] === dateStr);
      const leave = leaveRecords.find((l) => {
        const lStart = l.startDate.toISOString().split('T')[0];
        const lEnd = l.endDate.toISOString().split('T')[0];
        return dateStr >= lStart && dateStr <= lEnd;
      });

      let status: string = 'normal';
      if (isWeekend && !schedule) {
        status = 'weekend';
      } else if (schedule?.isHoliday) {
        status = 'holiday';
      } else if (schedule?.fieldWorkRecord) {
        status = 'field_work';
      } else if (leave) {
        status = 'leave';
      } else if (record?.isAbsent) {
        status = 'absent';
      } else if (record?.isLate) {
        status = 'late';
      } else if (record?.isEarlyLeave) {
        status = 'early_leave';
      }

      days.push({
        date: dateStr,
        status: status as any,
        checkInTime: record?.checkInTime?.toISOString() || null,
        checkOutTime: record?.checkOutTime?.toISOString() || null,
        shiftName: schedule?.shift?.name,
        remark: schedule?.fieldWorkRecord ? '外勤' : undefined,
      });
    }

    return { year, month, days };
  }
}