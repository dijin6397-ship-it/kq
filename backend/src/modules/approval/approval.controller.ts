import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DingtalkService } from '../../dingtalk/dingtalk.service';

@Controller('approval')
export class ApprovalController {
  constructor(
    private approvalService: ApprovalService,
    private dingtalkService: DingtalkService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('leave')
  async createLeave(@Request() req: any, @Body() body: any) {
    return this.approvalService.createLeave(req.user.sub, req.user.dingtalkUserId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('overtime')
  async createOvertime(@Request() req: any, @Body() body: any) {
    return this.approvalService.createOvertime(req.user.sub, req.user.dingtalkUserId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('patch-card')
  async createPatchCard(@Request() req: any, @Body() body: any) {
    return this.approvalService.createPatchCard(req.user.sub, req.user.dingtalkUserId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('business-trip')
  async createBusinessTrip(@Request() req: any, @Body() body: any) {
    return this.approvalService.createBusinessTrip(req.user.sub, req.user.dingtalkUserId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getList(@Request() req: any, @Query() query: any) {
    return this.approvalService.getApprovalList(req.user.sub, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':type/:id')
  async getDetail(@Param('type') type: string, @Param('id') id: number) {
    return this.approvalService.getApprovalDetail(type, id);
  }

  @Post('callback')
  async handleCallback(
    @Headers() headers: any,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const timestamp = headers['x-acs-dingtalk-event-timestamp'];
    const nonce = headers['x-acs-dingtalk-event-nonce'];
    const signature = headers['x-acs-dingtalk-event-signature'];

    if (!this.dingtalkService.verifyCallbackSignature(timestamp, nonce, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    res.status(200).end();

    setImmediate(() => {
      this.approvalService.handleCallback(body);
    });
  }
}