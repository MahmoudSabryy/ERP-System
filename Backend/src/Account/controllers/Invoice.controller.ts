import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CreateInvoiceDto } from '../dto/invoice.dto';
import { JwtAuthGuard } from 'src/Common/Guards/auth.guard';
import { ModuleAccessGuard } from 'src/Common/Guards/Module access.guard';
import { RequireModule } from 'src/Require module.decorator';
import { InvoiceService } from '../service/Invoice.service';

@Controller('accounting/invoices')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
@RequireModule('accounting')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(@Request() req, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(
      req.user.companyId,
      dto,
      req.user.userId,
    );
  }

  @Post(':id/post')
  async postInvoice(@Request() req, @Param('id') id: string) {
    return this.invoiceService.postInvoice(
      req.user.companyId,
      id,
      req.user.userId,
    );
  }

  @Get()
  async getInvoices(@Request() req, @Query('status') status?: string) {
    return this.invoiceService.getInvoices(req.user.companyId, status);
  }

  @Get(':id')
  async getInvoice(@Request() req, @Param('id') id: string) {
    return this.invoiceService.getInvoice(req.user.companyId, id);
  }

  @Delete(':id')
  async deleteInvoice(@Request() req, @Param('id') id: string) {
    return this.invoiceService.deleteInvoice(req.user.companyId, id);
  }
}
