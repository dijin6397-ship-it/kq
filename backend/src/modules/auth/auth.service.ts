import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { DingtalkService } from '../../dingtalk/dingtalk.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private dingtalk: DingtalkService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(authCode: string) {
    const { userId, unionId } = await this.dingtalk.getUserInfo(authCode);

    let user = await this.prisma.user.findUnique({
      where: { dingtalkUserId: userId },
    });

    if (!user) {
      const ddUser = await this.dingtalk.getUserDetail(userId);
      user = await this.prisma.user.create({
        data: {
          dingtalkUserId: userId,
          unionId: unionId,
          name: ddUser.name,
          avatar: ddUser.avatar,
          mobile: ddUser.mobile,
          email: ddUser.email,
          departmentId: ddUser.departmentId,
          departmentName: ddUser.departmentName,
        },
      });
    }

    const payload = {
      sub: user.id,
      dingtalkUserId: user.dingtalkUserId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      hireDate: user.hireDate,
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  }
}