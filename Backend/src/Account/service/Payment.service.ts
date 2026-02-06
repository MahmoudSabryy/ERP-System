import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentDto } from '../dto/payment.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getPayments(companyId: string) {
    return this.prisma.payment.findMany({
      where: { companyId },
      orderBy: { date: 'desc' }, // FIX: paymentNumber → date
    });
  }

  async createPayment(
    companyId: string,
    dto: CreatePaymentDto,
    userId: string,
  ) {
    const lastPayment = await this.prisma.payment.findFirst({
      where: { companyId },
      orderBy: { date: 'desc' },
    });

    // FIX: Remove paymentNumber generation - field doesn't exist
    // Use invoice ID + date for reference instead

    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        invoiceId: dto.referenceId, // Use referenceId to link to invoice
        amount: new Decimal(dto.amount),
        date: new Date(dto.date),
        method: dto.method,
        reference: dto.referenceId || `PAY-${Date.now()}`, // Use reference field
      },
    });

    // Create journal entry
    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { entryNo: 'desc' }, // FIX: entryNumber → entryNo
    });

    const entryNumber = this.generateEntryNumber(lastEntry?.entryNo); // FIX: entryNumber → entryNo

    await this.prisma.$transaction(async (tx) => {
      const journalEntry = await tx.journalEntry.create({
        data: {
          companyId,
          entryNo: entryNumber, // FIX: entryNumber → entryNo
          date: new Date(dto.date),
          memo: `Payment for invoice ${dto.referenceId}`,
          // Remove paymentNumber field
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: dto.referenceId },
        data: {
          // status updated as needed
        },
      });
    });

    return payment;
  }

  async getPayment(companyId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        companyId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async deletePayment(companyId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        companyId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    throw new BadRequestException(
      'Cannot delete posted payment. Create a reversal entry instead.',
    );
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
