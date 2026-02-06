import { Controller, Get, Req, Query } from '@nestjs/common';
import { ReportService } from '../service/Report.service';

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('trial-balance')
  async getTrialBalance(@Req() req: any, @Query('asOfDate') asOfDate?: string) {
    // FIX: Pass string directly, service converts to Date
    return this.reportService.getTrialBalance(req.user.companyId, asOfDate);
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Req() req: any, @Query('asOfDate') asOfDate?: string) {
    // FIX: Pass string directly, service converts to Date
    return this.reportService.getBalanceSheet(req.user.companyId, asOfDate);
  }

  @Get('income-statement')
  async getIncomeStatement(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // FIX: Pass strings directly, service converts to Date
    return this.reportService.getIncomeStatement(
      req.user.companyId,
      startDate || new Date().toISOString().split('T')[0],
      endDate || new Date().toISOString().split('T')[0],
    );
  }
}
