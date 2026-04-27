import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('personal')
  async getPersonalStatistics(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    return this.statisticsService.getPersonalStatistics(req.user.sub, y, m);
  }

  @Get('department')
  async getDepartmentStatistics(
    @Request() req: any,
    @Query('deptId') deptId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    const d = parseInt(deptId) || req.user.departmentId;
    return this.statisticsService.getDepartmentStatistics(d, y, m);
  }
}