import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DingtalkService } from '../../dingtalk/dingtalk.service';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    private prisma: PrismaService,
    private dingtalk: DingtalkService,
  ) {}

  async createLeave(userId: number, dingtalkUserId: string, dto: {
    leaveType: string;
    startDate: string;
    endDate: string;
    startTimePeriod: string;
    endTimePeriod: string;
    durationDays: number;
    reason: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const { processInstanceId } = await this.dingtalk.createApprovalInstance(
      'PROC-X-X-X', // 请假审批流 Code
      dingtalkUserId,
      user?.departmentId || 0,
      '',
      [
        { name: '请假类型', value: dto.leaveType },
        { name: '开始日期', value: dto.startDate },
        { name: '结束日期', value: dto.endDate },
        { name: '时长', value: `${dto.durationDays}天` },
        { name: '原因', value: dto.reason },
      ],
    );

    return this.prisma.leaveRecord.create({
      data: {
        userId,
        dingtalkUserId,
        leaveType: dto.leaveType as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        startTimePeriod: dto.startTimePeriod,
        endTimePeriod: dto.endTimePeriod,
        durationDays: dto.durationDays,
        reason: dto.reason,
        approvalInstanceId: processInstanceId,
      },
    });
  }

  async createOvertime(userId: number, dingtalkUserId: string, dto: {
    overtimeDate: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    dayType: string;
    reason: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const { processInstanceId } = await this.dingtalk.createApprovalInstance(
      'PROC-X-X-X', // 加班审批流 Code
      dingtalkUserId,
      user?.departmentId || 0,
      '',
      [
        { name: '加班日期', value: dto.overtimeDate },
        { name: '开始时间', value: dto.startTime },
        { name: '结束时间', value: dto.endTime },
        { name: '时长', value: `${dto.durationHours}小时` },
        { name: '加班类型', value: dto.dayType },
        { name: '原因', value: dto.reason },
      ],
    );

    return this.prisma.overtimeRecord.create({
      data: {
        userId,
        dingtalkUserId,
        overtimeDate: new Date(dto.overtimeDate),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        durationHours: dto.durationHours,
        dayType: dto.dayType as any,
        reason: dto.reason,
        approvalInstanceId: processInstanceId,
      },
    });
  }

  async createPatchCard(userId: number, dingtalkUserId: string, dto: {
    patchDate: string;
    patchType: string;
    targetTime: string;
    reason: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const { processInstanceId } = await this.dingtalk.createApprovalInstance(
      'PROC-X-X-X', // 补卡审批流 Code
      dingtalkUserId,
      user?.departmentId || 0,
      '',
      [
        { name: '补卡日期', value: dto.patchDate },
        { name: '补卡时间', value: dto.targetTime },
        { name: '补卡类型', value: dto.patchType },
        { name: '原因', value: dto.reason },
      ],
    );

    return this.prisma.patchCardRecord.create({
      data: {
        userId,
        dingtalkUserId,
        patchDate: new Date(dto.patchDate),
        patchType: dto.patchType,
        targetTime: new Date(dto.targetTime),
        reason: dto.reason,
        approvalInstanceId: processInstanceId,
      },
    });
  }

  async createBusinessTrip(userId: number, dingtalkUserId: string, dto: {
    startDate: string;
    endDate: string;
    destination: string;
    reason: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const { processInstanceId } = await this.dingtalk.createApprovalInstance(
      'PROC-X-X-X', // 出差审批流 Code
      dingtalkUserId,
      user?.departmentId || 0,
      '',
      [
        { name: '开始日期', value: dto.startDate },
        { name: '结束日期', value: dto.endDate },
        { name: '目的地', value: dto.destination },
        { name: '原因', value: dto.reason },
      ],
    );

    return this.prisma.fieldWorkRecord.create({
      data: {
        userId,
        dingtalkUserId,
        scheduleId: 0,
        checkInTime: new Date(),
        latitude: 0,
        longitude: 0,
        address: dto.destination,
        remark: dto.reason,
      },
    });
  }

  async getApprovalList(userId: number, query: {
    type?: string;
    status?: string;
    page?: number;
    size?: number;
  }) {
    const page = query.page || 1;
    const size = query.size || 20;
    const skip = (page - 1) * size;

    const where: any = { userId };

    if (query.type === 'leave') {
      return this.prisma.leaveRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      });
    } else if (query.type === 'overtime') {
      return this.prisma.overtimeRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      });
    } else if (query.type === 'patch_card') {
      return this.prisma.patchCardRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      });
    }

    const [leaves, overtimes, patchCards] = await Promise.all([
      this.prisma.leaveRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.overtimeRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.patchCardRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const merged = [
      ...leaves.map((r) => ({ ...r, _type: 'leave' })),
      ...overtimes.map((r) => ({ ...r, _type: 'overtime' })),
      ...patchCards.map((r) => ({ ...r, _type: 'patch_card' })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return merged.slice(skip, skip + size);
  }

  async getApprovalDetail(type: string, id: number) {
    if (type === 'leave') {
      return this.prisma.leaveRecord.findUnique({ where: { id } });
    } else if (type === 'overtime') {
      return this.prisma.overtimeRecord.findUnique({ where: { id } });
    } else if (type === 'patch_card') {
      return this.prisma.patchCardRecord.findUnique({ where: { id } });
    }
    return null;
  }

  async handleCallback(body: any) {
    const { processInstanceId, type, result } = body;

    this.logger.log(`Processing approval callback: ${processInstanceId}, result: ${result}`);

    const status = result === 'agree' ? 'approved' : 'rejected';

    const leave = await this.prisma.leaveRecord.findFirst({
      where: { approvalInstanceId: processInstanceId },
      include: { user: true },
    });

    if (leave) {
      await this.prisma.leaveRecord.update({
        where: { id: leave.id },
        data: { status, approvalResult: result, approvedAt: new Date() },
      });

      if (status === 'approved') {
        await this.dingtalk.sendWorkNotice(leave.dingtalkUserId, {
          type: 'text',
          content: `您的请假申请已通过（${leave.startDate} 至 ${leave.endDate}）`,
        });
      }
      return;
    }

    const overtime = await this.prisma.overtimeRecord.findFirst({
      where: { approvalInstanceId: processInstanceId },
      include: { user: true },
    });

    if (overtime) {
      await this.prisma.overtimeRecord.update({
        where: { id: overtime.id },
        data: { status, approvalResult: result, approvedAt: new Date() },
      });

      if (status === 'approved') {
        await this.dingtalk.sendWorkNotice(overtime.dingtalkUserId, {
          type: 'text',
          content: `您的加班申请已通过（${overtime.overtimeDate}）`,
        });
      }
      return;
    }

    const patchCard = await this.prisma.patchCardRecord.findFirst({
      where: { approvalInstanceId: processInstanceId },
      include: { user: true },
    });

    if (patchCard) {
      await this.prisma.patchCardRecord.update({
        where: { id: patchCard.id },
        data: { status, approvalResult: result, approvedAt: new Date() },
      });

      if (status === 'approved') {
        await this.dingtalk.sendWorkNotice(patchCard.dingtalkUserId, {
          type: 'text',
          content: `您的补卡申请已通过（${patchCard.patchDate}）`,
        });
      }
    }
  }
}