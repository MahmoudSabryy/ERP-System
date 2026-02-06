import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateJournalEntryDto } from '../dto/journal.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async createJournalEntry(companyId: string, dto: CreateJournalEntryDto) {
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { entryNo: 'desc' },
    });

    const entryNumber = this.generateEntryNumber(lastEntry?.entryNo);

    return await this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          companyId,
          entryNo: entryNumber,
          date: new Date(dto.date),
          memo: dto.description || '', // FIX: Use description field only
          lines: {
            create: dto.lines.map((line) => ({
              accountId: line.accountId,
              debit: new Decimal(line.debit || 0),
              credit: new Decimal(line.credit || 0),
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      return entry;
    });
  }

  async postJournalEntry(companyId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    const totalDebit = entry.lines.reduce((sum, line) => sum.plus(line.debit), new Decimal(0));
    const totalCredit = entry.lines.reduce((sum, line) => sum.plus(line.credit), new Decimal(0));

    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestException('Entry must be balanced to post');
    }

    for (const line of entry.lines) {
      await this.prisma.account.update({
        where: { id: line.accountId },
        data: {
          balance: {
            increment: line.debit.minus(line.credit),
          },
        },
      });
    }

    return this.getJournalEntry(companyId, entryId);
  }

  async getJournalEntry(companyId: string, entryId: string) {
    return this.prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });
  }

  async getJournalEntries(companyId: string) {
    return this.prisma.journalEntry.findMany({
      where: { companyId },
      include: {
        lines: {
          include: { account: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async reverseJournalEntry(companyId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { entryNo: 'desc' },
    });

    const reversingEntryNumber = this.generateEntryNumber(lastEntry?.entryNo);

    return await this.prisma.$transaction(async (tx) => {
      const reversingEntry = await tx.journalEntry.create({
        data: {
          companyId,
          entryNo: reversingEntryNumber,
          date: new Date(),
          memo: `Reversing entry for ${entry.memo}`,
          lines: {
            create: entry.lines.map((line) => ({
              accountId: line.accountId,
              debit: line.credit,
              credit: line.debit,
            })),
          },
        },
      });

      return reversingEntry;
    });
  }

  private generateEntryNumber(lastNumber?: string): string {
    if (!lastNumber) {
      return 'JE-0001';
    }

    const match = lastNumber.match(/JE-(\d+)/);
    if (!match) {
      return 'JE-0001';
    }

    const num = parseInt(match[1], 10) + 1;
    return `JE-${num.toString().padStart(4, '0')}`;
  }
}
