import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { PaymentService } from '../service/Payment.service';
import { CreatePaymentDto } from '../dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(
      req.user.companyId,
      dto,
      req.user.userId,
    );
  }

  @Get()
  async findAll(@Req() req: any) {
    // FIX: Remove filters parameter
    return this.paymentService.getPayments(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.getPayment(req.user.companyId, id);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.deletePayment(req.user.companyId, id);
  }
}
