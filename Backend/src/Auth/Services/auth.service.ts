import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto, RegisterDto } from '../DTO/auth.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if company already exists
    const existingCompany = await this.prisma.company.findFirst({
      where: {
        OR: [
          { email: dto.companyEmail },
          { slug: this.generateSlug(dto.companyName) },
        ],
      },
    });

    if (existingCompany) {
      throw new ConflictException('Company already exists');
    }

    // Check if user email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create company with admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          slug: this.generateSlug(dto.companyName),
          email: dto.companyEmail,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: 'admin',
          companyId: company.id,
        },
      });

      // Activate accounting module by default
      const accountingModule = await tx.module.upsert({
        where: { slug: 'accounting' },
        update: {},
        create: {
          name: 'Accounting',
          slug: 'accounting',
          description: 'Financial accounting and reporting',
        },
      });

      await tx.companyModule.create({
        data: {
          companyId: company.id,
          moduleId: accountingModule.id,
          isActive: true,
        },
      });

      // Create default chart of accounts
      await this.createDefaultAccounts(tx, company.id);

      return { company, user };
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: result.user.id,
      companyId: result.company.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        slug: result.company.slug,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        slug: user.company.slug,
      },
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async createDefaultAccounts(tx: any, companyId: string) {
    const accounts = [
      // Assets
      { code: '1000', name: 'Assets', type: 'asset', parentId: null },
      { code: '1100', name: 'Current Assets', type: 'asset', parent: '1000' },
      { code: '1110', name: 'Cash', type: 'asset', parent: '1100' },
      {
        code: '1120',
        name: 'Accounts Receivable',
        type: 'asset',
        parent: '1100',
      },
      { code: '1200', name: 'Fixed Assets', type: 'asset', parent: '1000' },

      // Liabilities
      { code: '2000', name: 'Liabilities', type: 'liability', parentId: null },
      {
        code: '2100',
        name: 'Current Liabilities',
        type: 'liability',
        parent: '2000',
      },
      {
        code: '2110',
        name: 'Accounts Payable',
        type: 'liability',
        parent: '2100',
      },
      { code: '2120', name: 'Tax Payable', type: 'liability', parent: '2100' },

      // Equity
      { code: '3000', name: 'Equity', type: 'equity', parentId: null },
      { code: '3100', name: 'Owner Equity', type: 'equity', parent: '3000' },
      {
        code: '3200',
        name: 'Retained Earnings',
        type: 'equity',
        parent: '3000',
      },

      // Revenue
      { code: '4000', name: 'Revenue', type: 'revenue', parentId: null },
      { code: '4100', name: 'Sales Revenue', type: 'revenue', parent: '4000' },
      {
        code: '4200',
        name: 'Service Revenue',
        type: 'revenue',
        parent: '4000',
      },

      // Expenses
      { code: '5000', name: 'Expenses', type: 'expense', parentId: null },
      {
        code: '5100',
        name: 'Operating Expenses',
        type: 'expense',
        parent: '5000',
      },
      {
        code: '5110',
        name: 'Salaries Expense',
        type: 'expense',
        parent: '5100',
      },
      { code: '5120', name: 'Rent Expense', type: 'expense', parent: '5100' },
      {
        code: '5130',
        name: 'Utilities Expense',
        type: 'expense',
        parent: '5100',
      },
    ];

    const createdAccounts: { [key: string]: any } = {};

    for (const account of accounts) {
      const parentId = account.parent
        ? createdAccounts[account.parent]?.id
        : null;

      const created = await tx.account.create({
        data: {
          companyId,
          code: account.code,
          name: account.name,
          type: account.type,
          parentId,
          isActive: true,
        },
      });

      createdAccounts[account.code] = created;
    }
  }
}
