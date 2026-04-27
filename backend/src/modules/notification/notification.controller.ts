import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('unread')
  async getUnread(@Request() req: any) {
    return this.notificationService.getUnread(req.user.sub);
  }

  @Post('read/:id')
  async markAsRead(@Request() req: any, @Param('id') id: number) {
    return this.notificationService.markAsRead(req.user.sub, id);
  }
}