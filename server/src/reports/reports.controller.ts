import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('daily-sales')
  @ApiOperation({ summary: 'Daily sales summary' })
  dailySales(@Query('date') date?: string) {
    return this.reports.dailySales(date);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Low stock products' })
  lowStock(@Query('threshold') threshold?: string) {
    return this.reports.lowStock(threshold ? Number(threshold) : 10);
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Products expiring soon' })
  expiringSoon(@Query('days') days?: string) {
    return this.reports.expiringSoon(days ? Number(days) : 30);
  }
}
