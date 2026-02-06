import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/Common/Guards/auth.guard';
import { ModuleManagementService } from '../Services/modules.service';

@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModuleManagementController {
  constructor(private moduleService: ModuleManagementService) {}

  @Get()
  async getAllModules() {
    return this.moduleService.getAllModules();
  }

  @Post(':slug/activate')
  async activateModule(@Request() req, @Param('slug') slug: string) {
    return this.moduleService.activateModule(req.user.companyId, slug);
  }

  @Delete(':slug/deactivate')
  async deactivateModule(@Request() req, @Param('slug') slug: string) {
    return this.moduleService.deactivateModule(req.user.companyId, slug);
  }
}
