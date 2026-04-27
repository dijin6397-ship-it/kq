import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, todayRecords, pendingApprovals, lateToday] = await Promise.all([
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.attendanceRecord.count({
        where: { workDate: today },
      }),
      this.prisma.leaveRecord.count({ where: { status: 'pending' } }),
      this.prisma.attendanceRecord.count({
        where: { workDate: today, isLate: true },
      }),
    ]);

    return {
      totalUsers,
      todayCheckIn: todayRecords,
      pendingApprovals,
      lateToday,
    };
  }

  async getRecords(query: {
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) {
    const page = query.page || 1;
    const size = query.size || 50;
    const skip = (page - 1) * size;

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.startDate) {
      where.workDate = { ...where.workDate, gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.workDate = { ...where.workDate, lte: new Date(query.endDate) };
    }

    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        include: { user: { select: { name: true, departmentName: true } } },
        orderBy: { workDate: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return { records, total, page, size };
  }

  async correctRecord(id: number, data: {
    checkInTime?: string;
    checkOutTime?: string;
    isLate?: boolean;
    isEarlyLeave?: boolean;
    isAbsent?: boolean;
    lateMinutes?: number;
    earlyMinutes?: number;
  }) {
    return this.prisma.attendanceRecord.update({
      where: { id },
      data: {
        checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
        isLate: data.isLate,
        isEarlyLeave: data.isEarlyLeave,
        isAbsent: data.isAbsent,
        lateMinutes: data.lateMinutes,
        earlyMinutes: data.earlyMinutes,
      },
    });
  }

  async getUsers(query?: { departmentId?: number; status?: string }) {
    const where: any = {};
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.status) where.status = query.status;
    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: number, data: {
    role?: string;
    departmentId?: number;
    departmentName?: string;
    status?: string;
  }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}