import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE = 'requireModule';
export const RequireModule = (moduleName: string) =>
  SetMetadata(REQUIRE_MODULE, moduleName);
