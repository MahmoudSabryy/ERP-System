import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ModuleManagementService {
  constructor(private prisma: PrismaService) {}

  async getAllModules() {
    return this.prisma.module.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async activateModule(companyId: string, moduleSlug: string) {
    // Check if module exists
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if already activated
    const existing = await this.prisma.companyModule.findUnique({
      where: {
        companyId_moduleId: {
          companyId,
          moduleId: module.id,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Module already activated');
      }
      // Reactivate
      return this.prisma.companyModule.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: { module: true },
      });
    }

    // Activate new module
    return this.prisma.companyModule.create({
      data: {
        companyId,
        moduleId: module.id,
        isActive: true,
      },
      include: { module: true },
    });
  }

  async deactivateModule(companyId: string, moduleSlug: string) {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const companyModule = await this.prisma.companyModule.findUnique({
      where: {
        companyId_moduleId: {
          companyId,
          moduleId: module.id,
        },
      },
    });

    if (!companyModule) {
      throw new NotFoundException('Module not activated for this company');
    }

    return this.prisma.companyModule.update({
      where: { id: companyModule.id },
      data: { isActive: false },
      include: { module: true },
    });
  }
}
