import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { AccountService } from 'src/Account/service/account.service';
import { AuthService } from 'src/Auth/Services/auth.service';
import { CompanyService } from 'src/Company/Services/company.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AccountService,
    CompanyService,
    AuthService,
    JwtService,
    PrismaService,
  ],
})
export class AppModule {}
