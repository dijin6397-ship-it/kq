import { Controller, Get, Post, Body, Query, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private exportService: ExportService) {}

  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @Get()
  async export(@Query() query: any, @Res() res: Response) {
    const data = await this.exportService.exportAttendance({
      startDate: query.startDate,
      endDate: query.endDate,
      userId: query.userId ? parseInt(query.userId) : undefined,
      format: query.format || 'xlsx',
    });

    res.setHeader(
      'Content-Type',
      query.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_export.${query.format || 'xlsx'}`,
    );
    res.send(Buffer.from(data, 'base64'));
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @Post('task')
  async createTask(@Request() req: any, @Body() body: any) {
    return this.exportService.createExportTask(req.user.sub, body.type, body.format, body.params);
  }
}