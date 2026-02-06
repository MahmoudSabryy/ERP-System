import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ModuleMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['tenant-id'] as string; // تأكد من أن tenant-id هو string
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID is required' });
    }

    const company = await this.prisma.company.findUnique({
      where: { id: tenantId }, // تأكد من أن ID هو string
      include: { modules: true },
    });

    const isModuleActive =
      company?.modules?.some((module) => module.isActive) ?? false;

    if (!isModuleActive) {
      return res
        .status(403)
        .json({ message: 'Module not active for this company' });
    }

    next();
  }
}
