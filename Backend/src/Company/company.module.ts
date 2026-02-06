import { Module } from '@nestjs/common';
import { CompanyController } from './Controllers/company.controller';
import { CompanyService } from './Services/company.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
