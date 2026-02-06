import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/Common/Guards/auth.guard';
import { ModuleAccessGuard } from 'src/Common/Guards/Module access.guard';
import { RequireModule } from 'src/Require module.decorator';
import { AccountService } from '../service/account.service';
import { CreateAccountDto, UpdateAccountDto } from '../DTO/Account.dto';

@Controller('accounting/accounts')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
@RequireModule('accounting')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  async createAccount(@Req() req, @Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(req.user.companyId, dto);
  }

  @Get()
  async getAccounts(@Req() req: any, @Query('type') type?: string) {
    return this.accountService.getAccounts(req.user.companyId, type);
  }

  @Get('chart')
  async getChartOfAccounts(@Req() req) {
    return this.accountService.getChartOfAccounts(req.user.companyId);
  }

  @Get(':id')
  async getAccount(@Req() req, @Param('id') id: string) {
    return this.accountService.getAccountById(req.user.companyId, id);
  }

  @Put(':id')
  async updateAccount(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(req.user.companyId, id, dto);
  }

  @Delete(':id')
  async deleteAccount(@Req() req, @Param('id') id: string) {
    return this.accountService.deleteAccount(req.user.companyId, id);
  }
}
