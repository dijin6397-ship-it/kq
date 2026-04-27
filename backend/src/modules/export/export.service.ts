import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportAttendance(params: {
    startDate: string;
    endDate: string;
    userId?: number;
    format: 'xlsx' | 'pdf';
  }) {
    const where: any = {};
    if (params.startDate) {
      where.workDate = { ...where.workDate, gte: new Date(params.startDate) };
    }
    if (params.endDate) {
      where.workDate = { ...where.workDate, lte: new Date(params.endDate) };
    }
    if (params.userId) where.userId = params.userId;

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: { user: { select: { name: true, departmentName: true } } },
      orderBy: [{ workDate: 'asc' }, { userId: 'asc' }],
    });

    if (params.format === 'xlsx') {
      return this.exportToExcel(records);
    }

    return this.exportToPdf(records);
  }

  private async exportToExcel(records: any[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('考勤记录');

    sheet.columns = [
      { header: '日期', key: 'workDate', width: 12 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '部门', key: 'departmentName', width: 15 },
      { header: '上班时间', key: 'checkInTime', width: 18 },
      { header: '下班时间', key: 'checkOutTime', width: 18 },
      { header: '上班结果', key: 'checkInResult', width: 10 },
      { header: '下班结果', key: 'checkOutResult', width: 10 },
      { header: '考勤结果', key: 'timeResult', width: 10 },
      { header: '迟到(分)', key: 'lateMinutes', width: 10 },
      { header: '早退(分)', key: 'earlyMinutes', width: 10 },
    ];

    for (const record of records) {
      sheet.addRow({
        workDate: record.workDate.toISOString().split('T')[0],
        name: record.user?.name || '',
        departmentName: record.user?.departmentName || '',
        checkInTime: record.checkInTime?.toISOString() || '',
        checkOutTime: record.checkOutTime?.toISOString() || '',
        checkInResult: record.checkInResult || '',
        checkOutResult: record.checkOutResult || '',
        timeResult: record.timeResult || '',
        lateMinutes: record.lateMinutes || 0,
        earlyMinutes: record.earlyMinutes || 0,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer.toString('base64');
  }

  private async exportToPdf(records: any[]) {
    const html = this.generateAttendanceHtml(records);
    return Buffer.from(html).toString('base64');
  }

  private generateAttendanceHtml(records: any[]): string {
    const rows = records.map((r) => `
      <tr>
        <td>${r.workDate.toISOString().split('T')[0]}</td>
        <td>${r.user?.name || ''}</td>
        <td>${r.user?.departmentName || ''}</td>
        <td>${r.checkInTime?.toISOString() || '-'}</td>
        <td>${r.checkOutTime?.toISOString() || '-'}</td>
        <td>${r.timeResult || '-'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>考勤记录</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>考勤记录表</h1>
        <table>
          <thead>
            <tr>
              <th>日期</th><th>姓名</th><th>部门</th>
              <th>上班时间</th><th>下班时间</th><th>考勤结果</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;
  }

  async createExportTask(userId: number, type: string, format: string, params: any) {
    return this.prisma.exportTask.create({
      data: { userId, type, format, params: JSON.stringify(params) },
    });
  }
}