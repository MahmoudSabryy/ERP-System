import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateInvoiceDto } from '../dto/invoice.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(
    companyId: string,
    dto: CreateInvoiceDto,
    userId: string,
  ) {
    // Calculate totals
    const subtotal = dto.items.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0);

    const tax = Number(dto.tax || 0);
    const total = subtotal + tax;

    // Generate invoice number
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
    });

    const invoiceNumber = this.generateInvoiceNumber(lastInvoice?.number);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        number: invoiceNumber,
        customer: dto.customerName,
        issueDate: new Date(dto.date),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(),
        subtotal: new Decimal(subtotal),
        tax: new Decimal(tax),
        total: new Decimal(total),
        status: InvoiceStatus.draft,
      },
    });

    return invoice;
  }

  async postInvoice(companyId: string, invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // FIX: Compare with enum value directly (no quotes needed)
    if (invoice.status === InvoiceStatus.posted) {
      throw new BadRequestException('Invoice already posted');
    }

    // Get default accounts
    const arAccount = await this.prisma.account.findFirst({
      where: {
        companyId,
        code: '1120', // Accounts Receivable
      },
    });

    const salesAccount = await this.prisma.account.findFirst({
      where: {
        companyId,
        code: '4100', // Sales Revenue
      },
    });

    const taxAccount = await this.prisma.account.findFirst({
      where: {
        companyId,
        code: '2120', // Tax Payable
      },
    });

    if (!arAccount || !salesAccount) {
      throw new BadRequestException('Required accounts not found');
    }

    // Generate journal entry
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { entryNo: 'desc' },
    });

    const entryNumber = this.generateEntryNumber(lastEntry?.entryNo);

    // Create journal entry in transaction
    await this.prisma.$transaction(async (tx) => {
      const journalEntry = await tx.journalEntry.create({
        data: {
          companyId,
          entryNo: entryNumber,
          date: invoice.issueDate,
          memo: `Invoice ${invoice.number} - ${invoice.customer}`,
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.posted,
        },
      });

      // Update account balances
      await tx.account.update({
        where: { id: arAccount.id },
        data: {
          balance: {
            increment: invoice.total,
          },
        },
      });

      await tx.account.update({
        where: { id: salesAccount.id },
        data: {
          balance: {
            increment: invoice.subtotal.negated(),
          },
        },
      });

      if (invoice.tax.gt(0) && taxAccount) {
        await tx.account.update({
          where: { id: taxAccount.id },
          data: {
            balance: {
              increment: invoice.tax.negated(),
            },
          },
        });
      }
    });

    return this.getInvoice(companyId, invoiceId);
  }

  async getInvoices(companyId: string, status?: string) {
    const where: any = { companyId };

    if (status) {
      where.status = status as InvoiceStatus;
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: { issueDate: 'desc' },
    });
  }

  async getInvoice(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async deleteInvoice(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // FIX: Compare with enum value directly
    if (invoice.status !== InvoiceStatus.draft) {
      throw new BadRequestException('Cannot delete posted invoice');
    }

    await this.prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return { message: 'Invoice deleted successfully' };
  }

  private generateInvoiceNumber(lastNumber?: string): string {
    if (!lastNumber) {
      return 'INV-0001';
    }

    const match = lastNumber.match(/INV-(\d+)/);
    if (!match) {
      return 'INV-0001';
    }

    const num = parseInt(match[1], 10) + 1;
    return `INV-${num.toString().padStart(4, '0')}`;
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
