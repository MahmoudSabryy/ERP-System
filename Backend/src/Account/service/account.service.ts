import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from '../DTO/Account.dto';
import { PrismaService } from 'prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(companyId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: {
        companyId_code: {
          companyId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Account code already exists');
    }

    if (dto.parentId) {
      const parent = await this.prisma.account.findFirst({
        where: {
          id: dto.parentId,
          companyId,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent account not found');
      }

      const dtoTypeValue = dto.type as unknown as AccountType;
      if (parent.type !== dtoTypeValue) {
        throw new ConflictException('Parent account must be of the same type');
      }
    }

    const typeValue = dto.type as unknown as AccountType;
    return this.prisma.account.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        type: typeValue,
        parentId: dto.parentId,
        isActive: true,
        balance: 0,
      },
      include: {
        parent: true,
      },
    });
  }

  async getAccounts(companyId: string, type?: string) {
    const where: any = { companyId };

    if (type) {
      where.type = type as AccountType;
    }

    return this.prisma.account.findMany({
      where,
      include: {
        parent: true,
        children: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async getAccountById(companyId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        companyId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateAccount(
    companyId: string,
    accountId: string,
    dto: UpdateAccountDto,
  ) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        companyId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
      include: {
        parent: true,
      },
    });
  }

  async deleteAccount(companyId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        companyId,
      },
      include: {
        children: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.children.length > 0) {
      throw new ConflictException('Cannot delete account with sub-accounts');
    }

    await this.prisma.account.delete({
      where: { id: accountId },
    });

    return { message: 'Account deleted successfully' };
  }

  async getChartOfAccounts(companyId: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { code: 'asc' },
      include: {
        parent: true,
        children: true,
      },
    });

    const rootAccounts = accounts.filter((a) => !a.parentId);
    return this.buildAccountTree(rootAccounts, accounts);
  }

  private buildAccountTree(roots: any[], allAccounts: any[]): any[] {
    return roots.map((root) => ({
      ...root,
      children: allAccounts
        .filter((a) => a.parentId === root.id)
        .map((child) => ({
          ...child,
          children: allAccounts.filter((a) => a.parentId === child.id),
        })),
    }));
  }
}
