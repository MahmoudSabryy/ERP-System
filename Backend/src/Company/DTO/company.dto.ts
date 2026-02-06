import { IsString, IsNotEmpty, IsInt } from 'class-validator'; // استخدام class-validator للتحقق من صحة البيانات

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
export class GetCompanyByIdDto {
  @IsString()
  id: string; // ID الشركة
}
export class DeleteCompanyDto {
  @IsString()
  id: string; // ID الشركة لحذفها
}
