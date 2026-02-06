import { Module } from '@nestjs/common';
import { JournalController } from './controllers/journal.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { PaymentController } from './controllers/payment.controller';
import { ReportController } from './controllers/report.controller';
import { AccountService } from './service/account.service';
import { JournalService } from './service/Journal.service';
import { InvoiceService } from './service/Invoice.service';
import { PaymentService } from './service/Payment.service';
import { ReportService } from './service/Report.service';
import { AccountController } from './controllers/account.controller';

@Module({
  controllers: [
    AccountController,
    JournalController,
    InvoiceController,
    PaymentController,
    ReportController,
  ],
  providers: [
    AccountService,
    JournalService,
    InvoiceService,
    PaymentService,
    ReportService,
  ],
})
export class AccountingModule {}
