import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';

export const REQUIRE_MODULE = 'requireModule';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.get<string>(
      REQUIRE_MODULE,
      context.getHandler(),
    );

    if (!requiredModule) {
      return true; // No module requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if company has the module activated
    const companyModule = await this.prisma.company.findFirst({
      where: {
        id: user.companyId,
        modules: {
          some: {
            moduleId: module as unknown as string, // FIX: Cast Module to unknown first, then to string
          },
        },
        isActive: true,
      },
    });

    if (!companyModule) {
      throw new ForbiddenException(
        `Module '${requiredModule}' is not activated for this company`,
      );
    }

    return true;
  }
}
