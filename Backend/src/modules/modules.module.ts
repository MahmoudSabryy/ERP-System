import { Module } from '@nestjs/common';
import { ModuleManagementController } from './Controllers/modules.controller';
import { ModuleManagementService } from './Services/modules.service';

@Module({
  controllers: [ModuleManagementController],
  providers: [ModuleManagementService],
})
export class ModuleManagementModule {}
