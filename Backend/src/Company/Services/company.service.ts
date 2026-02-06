import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getCompanyInfo(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async getCompanyModules(companyId: string) {
    return this.prisma.companyModule.findMany({
      where: { companyId },
      include: {
        module: true,
      },
    });
  }
}
