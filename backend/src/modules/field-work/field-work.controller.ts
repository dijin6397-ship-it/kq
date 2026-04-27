import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { FieldWorkService } from './field-work.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('field-work')
@UseGuards(JwtAuthGuard)
export class FieldWorkController {
  constructor(private fieldWorkService: FieldWorkService) {}

  @Post('checkin')
  async checkin(@Request() req: any, @Body() body: any) {
    return this.fieldWorkService.checkin(req.user.sub, req.user.dingtalkUserId, body);
  }

  @Get('list')
  async getList(@Request() req: any, @Query('date') date?: string) {
    return this.fieldWorkService.getList(req.user.sub, date);
  }

  @Get('today')
  async getTodayFieldWork(@Request() req: any) {
    return this.fieldWorkService.getTodayFieldWork(req.user.sub);
  }
}