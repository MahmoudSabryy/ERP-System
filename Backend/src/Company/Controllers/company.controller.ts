import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/Common/Guards/auth.guard';
import { CompanyService } from '../Services/company.service';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('info')
  async getCompanyInfo(@Request() req) {
    return this.companyService.getCompanyInfo(req.user.companyId);
  }

  @Get('modules')
  async getModules(@Request() req) {
    return this.companyService.getCompanyModules(req.user.companyId);
  }
}
