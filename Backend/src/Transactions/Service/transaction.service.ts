import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement transaction service
  // Note: 'transaction' model doesn't exist in Prisma schema
  // This service needs to be reimplemented with correct model
}
