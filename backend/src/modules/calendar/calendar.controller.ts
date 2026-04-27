import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  async getCalendar(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;
    return this.calendarService.getCalendarData(req.user.sub, y, m);
  }
}