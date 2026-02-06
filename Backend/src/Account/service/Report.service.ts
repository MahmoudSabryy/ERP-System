import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getTrialBalance(companyId: string, asOfDate?: string) {
    return this.prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async getIncomeStatement(
    companyId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
        type: { in: ['revenue', 'expense'] as AccountType[] },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getBalanceSheet(companyId: string, asOfDate?: string) {
    return this.prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
        type: { in: ['asset', 'liability', 'equity'] as AccountType[] },
      },
      orderBy: { code: 'asc' },
    });
  }

  async getAccountBalance(
    companyId: string,
    accountId: string,
    type?: string,
    asOfDate?: string,
  ) {
    const where: any = {
      id: accountId,
      companyId,
    };

    if (type) {
      where.type = type.toLowerCase() as AccountType;
    }

    return this.prisma.account.findFirst({ where });
  }
}
