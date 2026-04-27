import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ScheduleAppService } from './schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleAppController {
  constructor(private scheduleService: ScheduleAppService) {}

  @Get('my')
  async getMySchedule(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    return this.scheduleService.getMySchedule(req.user.sub, y, m);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('shifts')
  async createShift(@Body() body: any) {
    return this.scheduleService.createShift(body);
  }

  @Get('shifts')
  async getShifts() {
    return this.scheduleService.getShifts();
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('groups')
  async createGroup(@Body() body: any) {
    return this.scheduleService.createGroup(body);
  }

  @Get('groups')
  async getGroups() {
    return this.scheduleService.getGroups();
  }
}