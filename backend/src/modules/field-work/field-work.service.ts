import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FieldWorkService {
  constructor(private prisma: PrismaService) {}

  async checkin(userId: number, dingtalkUserId: string, dto: {
    latitude: number;
    longitude: number;
    address: string;
    photoUrl?: string;
    remark?: string;
    workDate: string;
  }) {
    let schedule = await this.prisma.scheduleAssignment.findFirst({
      where: { userId, workDate: new Date(dto.workDate) },
    });

    if (!schedule) {
      schedule = await this.prisma.scheduleAssignment.create({
        data: { userId, shiftId: 0, workDate: new Date(dto.workDate), isHoliday: true },
      });
    }

    return this.prisma.fieldWorkRecord.create({
      data: {
        userId,
        dingtalkUserId,
        scheduleId: schedule.id,
        checkInTime: new Date(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        photoUrl: dto.photoUrl,
        remark: dto.remark,
      },
    });
  }

  async getList(userId: number, date?: string) {
    const where: any = { userId };
    if (date) {
      where.schedule = { workDate: new Date(date) };
    }
    return this.prisma.fieldWorkRecord.findMany({
      where,
      include: { schedule: true },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async getTodayFieldWork(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await this.prisma.scheduleAssignment.findFirst({
      where: { userId, workDate: today },
      include: { fieldWorkRecord: true },
    });

    return schedule?.fieldWorkRecord || null;
  }
}