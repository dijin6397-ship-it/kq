import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('today')
  async getTodayStatus(@Request() req: any) {
    const user = req.user;
    return this.attendanceService.getTodayStatus(user.sub, user.dingtalkUserId);
  }

  @Get('today/detail')
  async getTodayDetail(@Request() req: any) {
    const user = req.user;
    return this.attendanceService.getTodayDetail(user.sub, user.dingtalkUserId);
  }
}