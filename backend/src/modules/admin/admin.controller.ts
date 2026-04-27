import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('records')
  getRecords(@Query() query: any) {
    return this.adminService.getRecords(query);
  }

  @Post('records/:id/correct')
  correctRecord(@Param('id') id: number, @Body() body: any) {
    return this.adminService.correctRecord(id, body);
  }

  @Get('users')
  getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: number, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }
}